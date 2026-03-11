from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from groq import Groq

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/recommend", methods=["POST", "OPTIONS"])
def recommend():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    from flask_jwt_extended import verify_jwt_in_request
    verify_jwt_in_request()

    data = request.get_json()
    build = data.get("build", {})

    if not build:
        return jsonify({"error": "No build data provided"}), 400

    groq_key = current_app.config.get("GROQ_API_KEY", "")
    if not groq_key:
        return jsonify({"error": "Groq API key not configured"}), 500

    # Format build context for the AI
    items_text = "\n".join(
        f"- {item['slot_label']}: {item['gear_item']['name']} "
        f"(Tier: {item['gear_item']['tier']}, Perks: {', '.join(item['gear_item'].get('perks', []))})"
        for item in build.get("items", [])
    ) or "No gear selected yet."

    prompt = f"""You are a Destiny 2 expert helping players optimize their builds.

Analyze this build and explain why each gear choice is strong (or suggest improvements):

Class: {build.get('role', 'Unknown')}
Subclass: {build.get('subclass', 'Unknown')}
Activity: {build.get('activity', 'General')}
Build Title: {build.get('title', 'Untitled')}

Gear:
{items_text}

Provide:
1. A brief overall assessment of the build's synergy
2. Why each item is a strong (or weak) choice for this role/activity
3. 1-2 specific improvements or alternatives the player should consider
Keep your response concise and practical."""

    try:
        client = Groq(api_key=groq_key)
        chat = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=600,
        )
        recommendation = chat.choices[0].message.content
        return jsonify({"recommendation": recommendation}), 200
    except Exception as e:
        current_app.logger.error(f"Groq error: {e}")
        return jsonify({"error": f"AI service error: {str(e)}"}), 500