import { CicdStack } from './../lib/cicd-stack';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { App, CfnOutput, RemovalPolicy, Stack, Stage, StageProps } from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { EnvironmentUtils } from 'aws-cdk-lib/cx-api';
import { ShellStep } from 'aws-cdk-lib/pipelines';
import { GitHubWorkflow, DockerCredential, YamlFile, AwsCredentials } from 'cdk-pipelines-github';


const app = new App();

const pipeline = new GitHubWorkflow(app, 'Pipeline', {
  synth: new ShellStep('Build', {
    commands: [
      'yarn install',
      'yarn build',
    ],
  }),
  awsCreds: AwsCredentials.fromOpenIdConnect({
    gitHubActionRoleArn: 'arn:aws:iam::<account-id>:role/GitHubActionRole',
  }),
});

class CustomStage extends Stage {
  constructor(scope: App, id: string, props: StageProps){
    super(scope, id, props);
    const st = new CicdStack(this, 'Test', {
      env: {
        account: "123456789012",
        region: "eu-central-1",
      }
    });
  }
}

pipeline.addStageWithGitHubOptions(new CustomStage(app, 'Beta', {
//  env: BETA_ENV,
}), {
  gitHubEnvironment: { name: 'beta' },
});

/*
pipeline.addStageWithGitHubOptions(new MyStage(this, 'Prod', {
  env: PROD_ENV,
}), {
  gitHubEnvironment: { name: 'prod' },
});*/


app.synth();