export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const body = await request.json();
    const qaArray = (body.questions || []).filter(
      (q) => q.answer?.trim() != ""
    );

    const formatted = qaArray
      .map(
        (item, index) =>
          `Q${index + 1}: ${item.question}\nA${index + 1}: ${item.answer}`
      )
      .join("\n\n");

    const prompt = `
  You are an expert evaluator. Analyze the following Q&A pairs and score them.

  Evaluate each answer based on correctness, clarity, completeness, relevance, technical depth, and communication quality.

  Return ONLY a JSON object with this structure:

  {
    "questionsAttempted": <number of questions>,
    "averageScore": <average score out of 100>,
    "overallScore": <overall performance score out of 100>,
    "relevance": <average relevance score out of 100>,
    "technicalDepth": <average technical‑depth score out of 100>,
    "clarityCommunication": <average clarity & communication score out of 100>
  }

  Return only the JSON. Do not explain anything.

  Q&A to evaluate:

  ${formatted}
`;

    const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      prompt,
    });

    const text = aiResponse.response;

    const match = text.match(/\{[\s\S]*?\}/);
    let json;

    try {
      json = match
        ? JSON.parse(match[0])
        : { error: "No JSON found in response" };
    } catch (err) {
      json = { error: "Failed to parse JSON", raw: text };
    }

    return new Response(JSON.stringify(json), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow": "Content-Type",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
      },
    });
  },
};

