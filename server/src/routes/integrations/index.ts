import { Router } from 'express'
import githubRouter from './github'
import notionRouter from './notion'
import slackRouter from './slack'
import googleRouter from './google'

const integrationsRouter = Router()

integrationsRouter.use('/github', githubRouter)
integrationsRouter.use('/notion', notionRouter)
integrationsRouter.use('/slack', slackRouter)
integrationsRouter.use('/google', googleRouter)

export default integrationsRouter
