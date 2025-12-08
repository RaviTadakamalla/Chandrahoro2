# AI Prompt Configuration - Quick Start Guide

## 🚀 Getting Started

### Step 1: Access AI Prompt Settings

1. Login to ChandraHoro
2. Navigate to **Settings** page (click Settings in the navigation menu)
3. Scroll down to the **"AI Prompt Configuration"** section

### Step 2: Initialize System Defaults (Admin Only - First Time)

If you're an admin and this is the first time using the feature:

1. Click the **"Initialize Defaults"** button in the header
2. Wait for confirmation message
3. All 15 AI modules will now have system default prompts

### Step 3: Configure a Module

1. **Browse Modules**: Scroll through the grid of 15 AI modules
2. **Search**: Use the search bar to find a specific module
3. **Click Configure**: Click the "Configure" button on any module card

### Step 4: Edit Your Prompt

In the editor dialog:

1. **Enable Custom Prompt**: Toggle the "Use Custom Prompt" switch
2. **Edit Prompt**: Type your custom prompt in the text area
3. **Insert Variables**: Click on template variable badges to insert them
4. **Configure Settings**:
   - Output Format: Markdown, JSON, or Plain Text
   - Temperature: 0.0 (precise) to 2.0 (creative)
   - Max Tokens: 100 to 10000
5. **Test Your Prompt**: Click "Test Prompt" to preview with sample data
6. **Save**: Click "Save" to apply your changes

### Step 5: View Results

1. Navigate to **AI Insights** page
2. Your custom prompts will now be used for AI-generated insights
3. Each module will use your customized prompt instead of the default

## 📋 Example: Customizing Chart Interpretation

### Default Prompt:
```
You are an expert Vedic astrologer. Analyze the following birth chart and provide comprehensive insights.

Chart Data: {chart_data}
Birth Information: {birth_info}
Planetary Positions: {planets}

Provide a detailed interpretation covering personality, strengths, challenges, and life path.
```

### Custom Prompt Example:
```
As a compassionate Vedic astrologer, analyze this birth chart with emphasis on spiritual growth and life purpose.

Birth Chart: {chart_data}
Born: {birth_info}
Planets: {planets}

Focus on:
1. Soul's purpose and dharma
2. Spiritual gifts and talents
3. Karmic lessons and growth areas
4. Remedies for spiritual advancement

Use a warm, encouraging tone.
```

## 🎯 Tips for Writing Good Prompts

### 1. Be Specific
❌ "Analyze the chart"
✅ "Analyze the birth chart focusing on career potential and timing"

### 2. Use Template Variables
Always include relevant variables like `{chart_data}`, `{birth_info}`, `{planets}`

### 3. Set the Tone
Specify the tone you want: professional, compassionate, direct, spiritual, etc.

### 4. Structure Your Output
Ask for specific sections or bullet points for better organization

### 5. Test Before Saving
Always use the "Test Prompt" feature to preview how it will look

## 🔧 Configuration Options Explained

### Temperature
- **0.0 - 0.3**: Very precise, factual, consistent
- **0.4 - 0.7**: Balanced (recommended for most uses)
- **0.8 - 1.2**: Creative, varied responses
- **1.3 - 2.0**: Very creative, experimental

### Max Tokens
- **500-1000**: Brief insights
- **1000-2000**: Standard detailed analysis (recommended)
- **2000-4000**: Comprehensive, in-depth readings
- **4000+**: Very detailed, extensive analysis

### Output Format
- **Markdown**: Formatted text with headings, lists, emphasis (recommended)
- **JSON**: Structured data format
- **Plain Text**: Simple unformatted text

## 🔄 Resetting to Default

If you want to go back to the system default:

1. Find the module card
2. Click the **"Reset"** button
3. Confirm the action
4. The module will now use the system default prompt

## 📊 Understanding the Statistics

At the top of the AI Prompts page, you'll see:

- **Total Modules**: 15 (all available AI modules)
- **Custom Prompts**: Number of modules you've customized
- **Using Defaults**: Number of modules using system defaults

## 🎨 Available Template Variables by Module

### Chart Interpretation
- `{chart_data}`, `{birth_info}`, `{planets}`, `{houses}`, `{aspects}`

### Dasha Predictions
- `{chart_data}`, `{current_dasha}`, `{upcoming_dashas}`, `{dasha_timeline}`

### Transit Analysis
- `{chart_data}`, `{current_transits}`, `{transit_dates}`, `{affected_houses}`

### Yoga Analysis
- `{chart_data}`, `{yogas}`, `{yoga_strengths}`, `{activation_periods}`

### Remedial Measures
- `{chart_data}`, `{challenging_factors}`, `{weak_planets}`, `{afflictions}`

### Compatibility Analysis
- `{primary_chart}`, `{partner_chart}`, `{focus_areas}`

### Match Horoscope
- `{primary_chart}`, `{partner_chart}`, `{guna_milan_score}`, `{ashtakoot_scores}`, `{doshas}`

### Prashna (Horary)
- `{chart_data}`, `{question}`, `{current_transits}`

### Chat
- `{conversation_history}`, `{question}`, `{chart_data}`

## ❓ Troubleshooting

### "Missing template variables" warning
**Solution**: Make sure you've included all required variables for that module

### Prompt is too long
**Solution**: Reduce the prompt length or increase max_tokens setting

### AI responses are inconsistent
**Solution**: Lower the temperature setting (try 0.5-0.7)

### AI responses are too generic
**Solution**: Increase temperature slightly and add more specific instructions

## 🎓 Best Practices

1. **Start with the default**: View the system default prompt first for reference
2. **Test frequently**: Use the test feature to preview changes
3. **Iterate**: Refine your prompts based on the AI responses you get
4. **Keep it focused**: Each module has a specific purpose - stay on topic
5. **Use clear language**: The AI responds better to clear, specific instructions
6. **Include context**: Always use template variables to provide chart data

## 📞 Need Help?

- Check the full documentation: `AI_PROMPTS_UI_IMPLEMENTATION.md`
- Contact support if you encounter issues
- Share your best prompts with the community!

---

**Happy Customizing! 🌟**

