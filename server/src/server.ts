import express from 'express'
import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import { convertHourStringToMinutes } from './utils/convert-hour-string-to-minutes'
import { convertMinutesToHoutString } from './utils/convert-minutes-to-hour-string'

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

app.get('/games', async (request, response) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true
        }
      }
    }
  })

  return response.status(201).json(games)
})

app.post('/games/:id/ads', async (request, response) => {
  const gameId = request.params.id
  const body = request.body

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      discord: body.discord,
      weekDays: body.weekDays.join(','),
      hourStart: convertHourStringToMinutes(body.hourStart),
      hourEnd: convertHourStringToMinutes(body.hourEnd),
      useVoiceChannel: body.useVoiceChannel,
    }
  })

  return response.status(201).json(ad)
})

app.get('/games/:id/ads', async (request, response) => {
  const gameId = request.params.id

  const ads: any = await prisma.ad.findMany({ 
    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
    },
    where: {
      gameId
    },
    orderBy: {
      createdAt: 'desc'
    }
})

  return response.status(201).json(ads.map((ad: any) => {
    return {
      ...ad,
      weekDays: ad.weekDays.split(','),
      hourStart: convertMinutesToHoutString(ad.hourStart),
      hourEnd: convertMinutesToHoutString(ad.hourEnd),
    }
  }))
})

app.get('/ads/:id/discord', async (request, response) => {
  const adId = request.params.id
  const ad = await prisma.ad.findUniqueOrThrow({ 
    where: {
      id: adId
    },
    select: {
      discord: true
    }
  })

  return response.status(201).json({
    discord: ad.discord
  })
})


app.listen(3333)