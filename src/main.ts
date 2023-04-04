// import { NestFactory } from '@nestjs/core';

// import { AppModule } from './app.module';

// const port = process.env.PORT || 4000;

// async function bootstrap() {

//   let app: any;

//   try {
//     app = await NestFactory.create(AppModule);
//   } catch (error) {
//     console.log({ error });
//   }

//   app.enableCors({
//     origin: (req, callback) => callback(null, true),
//   });

//   await app.listen(port);
// }
// bootstrap()
//   .then(() => {
//     console.log('App is running on %s port', port);
//   })
//   .catch(err => {
//     console.log({ err });
//   });

import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppModule } from './app.module';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule, { cors: true });
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
