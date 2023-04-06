import { DynamoDBClient as DynamoDBClientType } from "@aws-sdk/client-dynamodb";
import { CreateBucketCommand, S3Client as S3ClientType } from "@aws-sdk/client-s3";
import { XRayClient as XRayClientType } from "@aws-sdk/client-xray";


export async function lambdaWrapper(): Promise<string> {
  const s3Client = await sdkLoader("S3")
  const command = new CreateBucketCommand({
    Bucket: "test123"
  });
  s3Client.send(command);
  return 'lambda-library';
}

export type AWS_SDKs = {
  // "STEP_FUNCTION",
  // "LAMBDA",
  "XRAY": XRayClientType,
  "DYNAMODB": DynamoDBClientType,
  // "EVENTBRIDGE",
  //"SNS",
  //"SQS",
  "S3": S3ClientType
}

type ClientUnion = XRayClientType | DynamoDBClientType | S3ClientType | undefined

async function sdkLoader(sdk: "S3", region?: string): Promise<S3ClientType>
async function sdkLoader(sdk: "XRAY", region?: string): Promise<XRayClientType>
async function sdkLoader(sdk: "DYNAMODB", region?: string): Promise<DynamoDBClientType>
async function sdkLoader(sdk: string, region = "eu-central-1"): Promise<ClientUnion> {
  if (sdk === "S3") {
    const { S3Client } = await import("@aws-sdk/client-s3");
    return new S3Client({ region });
  }
  if (sdk === "DYNAMODB") {
    const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb")
    return new DynamoDBClient({ region });
  }
  if (sdk === "XRAY") {
    const { XRayClient } = await import("@aws-sdk/client-xray");
    return new XRayClient({ region });
  }
  return undefined;
}