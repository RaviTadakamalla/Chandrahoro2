"""
AI Service for Vedic Astrology Chart Interpretation.
Supports multiple LLM providers with prompt engineering and response processing.
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)


class AIProvider(ABC):
    """Abstract base class for AI providers."""

    @abstractmethod
    async def generate_interpretation(self, chart_data: Dict[str, Any],
                                     prompt_template: str) -> Dict[str, Any]:
        """Generate chart interpretation using the provider."""
        pass

    @abstractmethod
    async def generate_chat_response(self, chart_data: Dict[str, Any],
                                    question: str,
                                    conversation_history: List[Dict]) -> Dict[str, Any]:
        """Generate response to user question about chart."""
        pass


class AnthropicProvider(AIProvider):
    """Anthropic Claude provider implementation."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        try:
            import anthropic
            self.client = anthropic.Anthropic(api_key=self.api_key)
            self.model = "claude-3-5-sonnet-20241022"
        except ImportError:
            logger.warning("anthropic package not installed")
            self.client = None

    async def generate_interpretation(self, chart_data: Dict[str, Any],
                                     prompt_template: str) -> Dict[str, Any]:
        """Generate interpretation using Claude."""
        if not self.client:
            return {"success": False, "error": "Anthropic client not initialized"}

        try:
            chart_context = self._prepare_chart_context(chart_data)
            prompt = prompt_template.format(chart_context=chart_context)

            message = self.client.messages.create(
                model=self.model,
                max_tokens=4000,
                temperature=0.3,
                messages=[{"role": "user", "content": prompt}]
            )

            response_text = message.content[0].text

            return {
                "success": True,
                "content": response_text,
                "model": self.model,
                "tokens": {
                    "input": message.usage.input_tokens,
                    "output": message.usage.output_tokens
                },
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Anthropic API error: {e}")
            return {"success": False, "error": str(e)}

    async def generate_chat_response(self, chart_data: Dict[str, Any],
                                    question: str,
                                    conversation_history: List[Dict]) -> Dict[str, Any]:
        """Generate chat response using Claude."""
        if not self.client:
            return {"success": False, "error": "Anthropic client not initialized"}

        try:
            chart_context = self._prepare_chart_context(chart_data)
            messages = [{"role": msg["role"], "content": msg["content"]}
                       for msg in conversation_history]

            system_prompt = f"""You are an expert Vedic astrology interpreter.
Chart Data:
{chart_context}

Answer questions with accuracy and depth."""

            messages.append({"role": "user", "content": question})

            message = self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                temperature=0.3,
                system=system_prompt,
                messages=messages
            )

            response_text = message.content[0].text

            return {
                "success": True,
                "content": response_text,
                "model": self.model,
                "tokens": {
                    "input": message.usage.input_tokens,
                    "output": message.usage.output_tokens
                },
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Anthropic chat error: {e}")
            return {"success": False, "error": str(e)}

    def _prepare_chart_context(self, chart_data: Dict[str, Any]) -> str:
        """Prepare chart data for AI context."""
        context = []
        birth_info = chart_data.get("birth_info", {})
        context.append(f"Birth Date: {birth_info.get('date')}")
        context.append(f"Birth Time: {birth_info.get('time', 'Unknown')}")
        context.append(f"Location: {birth_info.get('location_name')}")
        context.append(f"\nAscendant: {chart_data.get('ascendant_sign')} {chart_data.get('ascendant', 0):.2f}°")
        context.append("\nPlanetary Positions:")
        planets = chart_data.get("planets", [])
        for planet in planets:
            context.append(f"  {planet.get('name')}: {planet.get('sign')} {planet.get('degree_in_sign', 0):.2f}°")
        return "\n".join(context)


class OpenAIProvider(AIProvider):
    """OpenAI GPT provider implementation."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        try:
            import openai
            openai.api_key = self.api_key
            self.client = openai
            self.model = "gpt-4-turbo"
        except ImportError:
            logger.warning("openai package not installed")
            self.client = None

    async def generate_interpretation(self, chart_data: Dict[str, Any],
                                     prompt_template: str) -> Dict[str, Any]:
        """Generate interpretation using GPT-4."""
        if not self.client:
            return {"success": False, "error": "OpenAI client not initialized"}

        try:
            chart_context = self._prepare_chart_context(chart_data)
            prompt = prompt_template.format(chart_context=chart_context)

            response = self.client.ChatCompletion.create(
                model=self.model,
                max_tokens=4000,
                temperature=0.3,
                messages=[{"role": "user", "content": prompt}]
            )

            response_text = response.choices[0].message.content

            return {
                "success": True,
                "content": response_text,
                "model": self.model,
                "tokens": {
                    "input": response.usage.prompt_tokens,
                    "output": response.usage.completion_tokens
                },
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return {"success": False, "error": str(e)}

    async def generate_chat_response(self, chart_data: Dict[str, Any],
                                    question: str,
                                    conversation_history: List[Dict]) -> Dict[str, Any]:
        """Generate chat response using GPT-4."""
        if not self.client:
            return {"success": False, "error": "OpenAI client not initialized"}

        try:
            chart_context = self._prepare_chart_context(chart_data)
            messages = [{"role": msg["role"], "content": msg["content"]}
                       for msg in conversation_history]

            system_prompt = f"""You are an expert Vedic astrology interpreter.
Chart Data:
{chart_context}

Answer questions with accuracy and depth."""

            messages.append({"role": "user", "content": question})

            response = self.client.ChatCompletion.create(
                model=self.model,
                max_tokens=2000,
                temperature=0.3,
                system=system_prompt,
                messages=messages
            )

            response_text = response.choices[0].message.content

            return {
                "success": True,
                "content": response_text,
                "model": self.model,
                "tokens": {
                    "input": response.usage.prompt_tokens,
                    "output": response.usage.completion_tokens
                },
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"OpenAI chat error: {e}")
            return {"success": False, "error": str(e)}

    def _prepare_chart_context(self, chart_data: Dict[str, Any]) -> str:
        """Prepare chart data for AI context."""
        context = []
        birth_info = chart_data.get("birth_info", {})
        context.append(f"Birth Date: {birth_info.get('date')}")
        context.append(f"Birth Time: {birth_info.get('time', 'Unknown')}")
        context.append(f"Location: {birth_info.get('location_name')}")
        context.append(f"\nAscendant: {chart_data.get('ascendant_sign')} {chart_data.get('ascendant', 0):.2f}°")
        context.append("\nPlanetary Positions:")
        planets = chart_data.get("planets", [])
        for planet in planets:
            context.append(f"  {planet.get('name')}: {planet.get('sign')} {planet.get('degree_in_sign', 0):.2f}°")
        return "\n".join(context)


class AIService:
    """Main AI Service for chart interpretation."""

    INTERPRETATION_PROMPT = """Provide a comprehensive Vedic astrology interpretation of this birth chart:

{chart_context}

Structure your response with these sections:
1. **Overall Personality & Life Path** - Based on Ascendant and Sun
2. **Emotional Nature** - Based on Moon position
3. **Intellect & Communication** - Based on Mercury
4. **Relationships & Creativity** - Based on Venus
5. **Energy & Drive** - Based on Mars
6. **Wisdom & Expansion** - Based on Jupiter
7. **Discipline & Karma** - Based on Saturn
8. **Key Life Themes** - Based on overall chart patterns

Be specific with planetary positions and astrological principles."""

    def __init__(self, provider: str = "anthropic"):
        self.provider_name = provider
        self.provider = self._initialize_provider(provider)

    def _initialize_provider(self, provider: str) -> AIProvider:
        """Initialize the appropriate AI provider."""
        if provider.lower() == "anthropic":
            return AnthropicProvider()
        elif provider.lower() == "openai":
            return OpenAIProvider()
        else:
            logger.warning(f"Unknown provider {provider}, defaulting to Anthropic")
            return AnthropicProvider()

    async def interpret_chart(self, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive chart interpretation."""
        return await self.provider.generate_interpretation(
            chart_data,
            self.INTERPRETATION_PROMPT
        )

    async def answer_question(self, chart_data: Dict[str, Any],
                             question: str,
                             conversation_history: Optional[List[Dict]] = None) -> Dict[str, Any]:
        """Answer a question about the chart."""
        history = conversation_history or []
        return await self.provider.generate_chat_response(
            chart_data,
            question,
            history
        )

