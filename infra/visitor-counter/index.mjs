import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});
const TABLE_NAME = "paycheck-overtime-visitor-counter";

export const handler = async () => {
  try {
    const result = await client.send(
      new UpdateItemCommand({
        TableName: TABLE_NAME,
        Key: { id: { S: "pageviews" } },
        UpdateExpression: "ADD #count :incr",
        ExpressionAttributeNames: { "#count": "count" },
        ExpressionAttributeValues: { ":incr": { N: "1" } },
        ReturnValues: "UPDATED_NEW",
      }),
    );

    const count = Number(result.Attributes.count.N);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count }),
    };
  } catch (err) {
    console.error("visitor-counter error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "failed to increment counter" }),
    };
  }
};
