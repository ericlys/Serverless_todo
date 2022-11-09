import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'todoserverless',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-dynamodb-local'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
  },
  // import the function via paths
  functions: {
    createTodo: {
      handler: "src/functions/createTodo.handler",
      events: [
        {
          http: {
            path: "todos/{userid}",
            method: "post",

            cors: true
          }
        }
      ]
    },
    getAllTodosByUser: {
      handler: "src/functions/userTodos.handler",
      events: [
        {
          http: {
            path: "todos/{userid}",
            method: "get",

            cors: true
          }
        }
      ]
    }
  },

  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    
    dynamodb: {
      stages: ["dev", "local"], 
      start: { 
        port: 8000, 
        inMemory: true, 
        migrate:true 
      }
    },
  },


  resources: {
    Resources: {
      dbTodo: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "todos_table",
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S"
            },
            {
              AttributeName: "user_id",
              AttributeType: "S"
            },
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH"
            }
          ],
          GlobalSecondaryIndexes: [
            { 
              IndexName: 'todo_index', 
              Projection: {
               ProjectionType:'ALL'
              },
              ProvisionedThroughput: {
                NumberOfDecreasesToday: 0,
                WriteCapacityUnits: 5,
                ReadCapacityUnits: 10
              },
              KeySchema: [
                  {
                    AttributeName: 'user_id',
                    KeyType: 'HASH',
                  }
              ]
            }
          ],
          
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
