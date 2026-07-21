import os
import structlog
import time

from langchain_groq import ChatGroq
from langchain_ollama import ChatOllama

from core.config import settings
from core.exceptions import LLMException


from langchain_core.messages import BaseMessage
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

logger = structlog.get_logger(__name__)


class LLMService:
    """
    Centralized LLM Service.

    Features
    --------
    • Ollama for local development
    • Groq Primary API
    • Groq Secondary API (automatic fallback)
    • LangSmith tracing
    • Structured logging
    """

    def __init__(self):

        self.environment = os.getenv(
            "ENVIRONMENT",
            "development"
        ).lower()

        self._initialize_langsmith()
        self._initialize_models()

        logger.info(
            "LLM Service initialized",
            environment=self.environment,
        )

    # -----------------------------------------------------
    # LangSmith
    # -----------------------------------------------------

    def _initialize_langsmith(self) -> None:
        """
        Enable LangSmith tracing if configured.
        """

        tracing = (
            str(settings.LANGSMITH_TRACING).lower() == "true"
        )

        if tracing:

            os.environ["LANGCHAIN_TRACING_V2"] = "true"
            os.environ["LANGCHAIN_API_KEY"] = settings.LANGSMITH_API_KEY
            os.environ["LANGCHAIN_PROJECT"] = settings.LANGSMITH_PROJECT
            os.environ["LANGCHAIN_ENDPOINT"] = settings.LANGSMITH_ENDPOINT

            logger.info(
                "LangSmith tracing enabled",
                project=settings.LANGSMITH_PROJECT,
            )

        else:

            logger.warning(
                "LangSmith tracing disabled."
            )

    # -----------------------------------------------------
    # Model Initialization
    # -----------------------------------------------------

    def _initialize_models(self) -> None:
        """
        Initialize all LLM providers.
        """

        try:

            # -----------------------------------------
            # Ollama
            # -----------------------------------------

            self.ollama = ChatOllama(
                model=settings.OLLAMA_MODEL,
                temperature=0.2,
                timeout=120,
            )

            logger.info(
                "Initialized Ollama",
                model=settings.OLLAMA_MODEL,
            )

            # -----------------------------------------
            # Groq Primary
            # -----------------------------------------

            self.groq_primary = ChatGroq(
                api_key=settings.GROQ_API_KEY,
                model=settings.GROQ_MODEL,
                temperature=0.2,
                timeout=60,
            )

            logger.info(
                "Initialized Groq Primary",
                model=settings.GROQ_MODEL,
            )

            # -----------------------------------------
            # Groq Secondary
            # -----------------------------------------

            self.groq_secondary = ChatGroq(
                api_key=settings.GROQ_FALLBACK_API_KEY,
                model=settings.GROQ_MODEL,
                temperature=0.2,
                timeout=60,
            )

            logger.info(
                "Initialized Groq Secondary",
                model=settings.GROQ_MODEL,
            )

        except Exception as e:

            logger.exception(
                "Failed to initialize LLM providers",
                error=str(e),
            )

            raise LLMException(
                "Unable to initialize language models."
            ) from e
        
        # -----------------------------------------------------
    # Retry Configuration
    # -----------------------------------------------------

    @retry(
        stop=stop_after_attempt(2),
        wait=wait_exponential(
            multiplier=1,
            min=1,
            max=5,
        ),
        retry=retry_if_exception_type(Exception),
        reraise=True,
    )
    async def _invoke_with_retry(
        self,
        provider,
        messages: list[BaseMessage],
    ):
        """
        Retry wrapper for every provider.
        """
        return await provider.ainvoke(messages)
    
        # -----------------------------------------------------
    # Ollama
    # -----------------------------------------------------

    async def _invoke_ollama(
        self,
        messages: list[BaseMessage],
    ):

        logger.info(
            "Invoking Ollama"
        )

        return await self._invoke_with_retry(
            self.ollama,
            messages,
        )
    
        # -----------------------------------------------------
    # Groq Primary
    # -----------------------------------------------------

    async def _invoke_groq_primary(
        self,
        messages: list[BaseMessage],
    ):

        logger.info(
            "Invoking Groq Primary"
        )

        return await self._invoke_with_retry(
            self.groq_primary,
            messages,
        )
        # -----------------------------------------------------
    # Groq Secondary
    # -----------------------------------------------------

    async def _invoke_groq_secondary(
        self,
        messages: list[BaseMessage],
    ):

        logger.info(
            "Invoking Groq Secondary"
        )

        return await self._invoke_with_retry(
            self.groq_secondary,
            messages,
        )
        # -----------------------------------------------------
    # Provider Selection
    # -----------------------------------------------------

    async def _invoke_provider(
        self,
        messages: list[BaseMessage],
    ):
        """
        Route requests based on provider.
        """

        provider = settings.LLM_PROVIDER.lower()

        if provider == "ollama":
            return await self._invoke_ollama(messages)

        if provider == "groq":

            try:

                return await self._invoke_groq_primary(
                    messages
                )

            except Exception as e:

                logger.warning(
                    "Primary Groq failed",
                    error=str(e),
                )

                logger.info(
                    "Switching to Secondary Groq"
                )

                return await self._invoke_groq_secondary(
                    messages
                )

        raise LLMException(
            f"Unsupported provider: {provider}"
        )
        # -----------------------------------------------------
    # Public API
    # -----------------------------------------------------

    async def invoke(
        self,
        messages: list[BaseMessage],
    ):
        """
        Invoke the configured LLM.

        Returns:
            AIMessage
        """

        start_time = time.perf_counter()

        try:

            response = await self._invoke_provider(
                messages
            )

            latency = (
                time.perf_counter() - start_time
            ) * 1000

            logger.info(
                "LLM invocation successful",
                provider=settings.LLM_PROVIDER,
                latency_ms=round(latency, 2),
            )

            return response

        except Exception as e:

            latency = (
                time.perf_counter() - start_time
            ) * 1000

            logger.exception(
                "LLM invocation failed",
                latency_ms=round(latency, 2),
                error=str(e),
            )

            raise LLMException(
                "Failed to generate LLM response."
            ) from e
        
        # -----------------------------------------------------
    # Active LLM
    # -----------------------------------------------------

    def get_llm(self):
        """
        Returns the active LangChain chat model.

        Useful for structured outputs.
        """

        provider = settings.LLM_PROVIDER.lower()

        if provider == "ollama":
            return self.ollama

        return self.groq_primary
    