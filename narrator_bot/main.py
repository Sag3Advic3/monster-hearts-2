import discord
from discord.ext import commands
import logging
from dotenv import load_dotenv
import os, random

load_dotenv()

token = os.getenv('DISCORD_TOKEN')

handler = logging.FileHandler(filename='discord.log', encoding='utf-8', mode='w')
intents = discord.Intents.default()
intents.message_content = True
intents.members = True

bot = commands.Bot(command_prefix='!', intents=intents)

@bot.event
async def on_ready():
    print(f'We have logged in as {bot.user}')

@bot.command()
async def roll(ctx):
    num1 = random.randint(1, 6)
    num2 = random.randint(1, 6)
    await ctx.send('{num1} + {num2} = {total}'.format(num1=num1, num2=num2, total=num1 + num2))

bot.run(token, log_handler=handler, log_level=logging.DEBUG)