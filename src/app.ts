import Koa from 'koa';
import { bodyParser } from "@koa/bodyparser";
import Router from '@koa/router';
import EditorRoutes from './routes/editor';
import KnowledgeRoutes from './routes/knowledge';
import QuestionRoutes from './routes/question';
import dotenv from 'dotenv';

dotenv.config();

const app = new Koa();
app.use(bodyParser());

const indexRouter = new Router();

indexRouter.use('/api/editor/:topic/:subtopic', EditorRoutes.routes(), EditorRoutes.allowedMethods());
indexRouter.use('/api/knowledge', KnowledgeRoutes.routes());
indexRouter.use('/api/question', QuestionRoutes.routes());

app.use(indexRouter.routes());

app.listen(3000, () => console.log('Listening on port 3000'));

export default app;