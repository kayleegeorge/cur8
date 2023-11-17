# from googleapiclient.discovery import build
# from googleapiclient.errors import HttpError

# DEVELOPER_KEY = 'AIzaSyCq6rR1L3qoRQxHCR2J9WGB1Eg4XAT_ClM'
# YOUTUBE_API_SERVICE_NAME = 'youtube'
# YOUTUBE_API_VERSION = 'v3'

# def get_video_captions(video_id):
#     youtube = build(YOUTUBE_API_SERVICE_NAME, YOUTUBE_API_VERSION, developerKey=DEVELOPER_KEY)
#     try:
#         caption = youtube.captions().list(
#             part='snippet',
#             videoId=video_id
#         ).execute()

#         caption_text = caption
#         return caption_text
#     except HttpError as e:
#         print(f"An error occurred: {e}")

from youtube_transcript_api import YouTubeTranscriptApi
import re
from typing import List
import tiktoken

from typing import List

def split_text_into_chunks(text: str) -> List[str]:
  max_words_per_chunk = 1000
  chunks = []
  current_chunk = ""

  # split the text into chunks of size max_words_per_chunk
  words = text.split()
  while words:
      current_chunk = words.pop(0)
      while len(current_chunk.split()) < max_words_per_chunk and words:
          word = words.pop(0)
          current_chunk += " " + word
      chunks.append(current_chunk)

  # merge consecutive chunks until they are smaller than max_words_per_chunk
  merged_chunks = []
  current_chunk = chunks.pop(0)
  while chunks:
      next_chunk = chunks.pop(0)
      if len(current_chunk.split()) + len(next_chunk.split()) < max_words_per_chunk:
          current_chunk += " " + next_chunk
      else:
          merged_chunks.append(current_chunk)
          current_chunk = next_chunk
  merged_chunks.append(current_chunk)

  return merged_chunks

# #old version
# def split_text_into_chunks(text: str) -> List[str]:
#   MAX_WORDS_PER_CHUNK = 1000
#   sentences = text.split('.') # split input text into sentences
#   chunks = []

#   current_chunk = ''
#   current_word_count = 0

#   for sentence in sentences:
#       words = sentence.strip().split(' ')
#       word_count = len(words)

#       # If adding this sentence to the current chunk would make the chunk too long,
#       # start a new chunk
#       if current_word_count + word_count > MAX_WORDS_PER_CHUNK:
#           chunks.append(current_chunk)
#           current_chunk = ''
#           current_word_count = 0

#       # Add the sentence to the current chunk
#       current_chunk += sentence + '.'
#       current_word_count += word_count

#   # Add any remaining text as the final chunk
#   if len(current_chunk) > 0:
#       chunks.append(current_chunk)

#   return chunks


def get_video_captions(url):
    video_id = url.split('=')[-1]
    transcriptItems = YouTubeTranscriptApi.get_transcript(video_id,
                                            languages=['en'])
    fullText = ''
    for item in transcriptItems:
        fullText += re.sub(r"(\r\n|\n|\r)", "", item['text']) + " "
    return fullText

def num_tokens_from_string(string: str, encoding_name: str) -> int:
    """Returns the number of tokens in a text string."""
    encoding = tiktoken.encoding_for_model(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens

# url = "https://www.youtube.com/watch?v=sY8aFSY2zv4"
# url = "https://www.youtube.com/watch?v=6tw_JVz_IEc"
txt = get_video_captions(url)
chunks = split_text_into_chunks(txt)
for chunk in chunks:
  print(num_tokens_from_string(chunk, "gpt-3.5-turbo"))


# Note: you need to be using OpenAI Python v0.27.0 for the code below to work
import openai
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.environ.get("OPENAI_API_KEY")
openai.api_key = api_key

def chat_gpt_call(chunks):
  promptQuestion = 'Please give a 3 bullet point summary of the following text with no header: '
  responses = ""
  for chunk in chunks:
    msg = promptQuestion + chunk
    res = openai.ChatCompletion.create(
      model="gpt-3.5-turbo",
      messages=[
            {"role": "user", "content": msg},
        ]
    )
    responses += res['choices'][0]['message']['content'] + "\n"
  return responses

print(chat_gpt_call(chunks))