#!/usr/bin/python

# This sample executes a search request for the specified search term.
# Sample usage:
#   python search.py --q=surfing --max-results=10
# NOTE: To use the sample, you must provide a developer key obtained
#       in the Google APIs Console. Search for "REPLACE_ME" in this code
#       to find the correct place to provide that key..

from youtube_transcript_api import YouTubeTranscriptApi
import re
from typing import List

import os
from dotenv import load_dotenv
import ssl
# movie
import moviepy
from moviepy.editor import VideoFileClip, concatenate_videoclips
from pytube import YouTube 
import requests
import glob
import numpy as np

# download to s3
import boto3
import time

# google api
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# flask stuff
from flask import Flask, request, send_from_directory
from flask_restful import reqparse, Api, Resource
import json
from flask_cors import CORS, cross_origin
import flask

CORS_ALLOWED = [
   "https://tranquil-meadow-99071.herokuapp.com", 
   "http://localhost:3000",
   "http://127.0.1:3000"
]

app = Flask(__name__, static_folder='build/server/pages', static_url_path='')
api = Api(app)
cors = CORS(app, resources={r"/vids": {"origins": "*"}, r"/vidclip": {"origins": "*"}, r"/vidsummary": {"origins": "*"}})

load_dotenv()

# Addresses bug encountered with pytube
ssl._create_default_https_context = ssl._create_stdlib_context

# Set DEVELOPER_KEY to the API key value from the APIs & auth > Registered apps
# tab of
#   https://cloud.google.com/console
# Please ensure that you have enabled the YouTube Data API for your project.
DEVELOPER_KEY = 'AIzaSyCq6rR1L3qoRQxHCR2J9WGB1Eg4XAT_ClM'
YOUTUBE_API_SERVICE_NAME = 'youtube'
YOUTUBE_API_VERSION = 'v3'

# CHANGE THIS IF YOU WANT TO USE YOUTUBE API --> set your dev_key in .env file (follow instructions above to make devkey)
def youtube_search_query(query):
  """
  Searches for up to 50 YouTube videos using the YouTube Data API.

  Parameters:
  -----------
  query : str
      The search query to be sent to the API.

  Returns:
  --------
  List[str]
      A list of YouTube video URLs that match the search query.

  Example:
  --------
  >>> urls = youtube_search_query('cats')
  >>> print(urls)
  ['https://www.youtube.com/watch?v=J---aiyznGQ', 'https://www.youtube.com/watch?v=nRkP-rplNjs', ...]
  """

  youtube = build(YOUTUBE_API_SERVICE_NAME, YOUTUBE_API_VERSION,
    developerKey=DEVELOPER_KEY)
  search_response = youtube.search().list(
    q=query,
    part='id,snippet',
    maxResults=50 # can change this
    ).execute()

  videos = []
  channels = []
  playlists = []
  urls = []

    # Add each result to the appropriate list, and then display the lists of
    # matching videos, channels, and playlists.
  for search_result in search_response.get('items', []):
    if search_result['id']['kind'] == 'youtube#video':
        videos.append('%s (%s)' % (search_result['snippet']['title'],
                                  search_result['id']['videoId']))
        print(search_result['id'])
        videoId = search_result['id']['videoId']
        url = f'https://www.youtube.com/watch?v={videoId}'
        urls.append(url)
        
    elif search_result['id']['kind'] == 'youtube#channel':
        channels.append('%s (%s)' % (search_result['snippet']['title'],
                                    search_result['id']['channelId']))
    elif search_result['id']['kind'] == 'youtube#playlist':
        playlists.append('%s (%s)' % (search_result['snippet']['title'],
                                    search_result['id']['playlistId']))

  return urls

# search for video based on youtube id
def youtube_search_id(id):
  """
  Returns JSON-formatted data about a YouTube video with the given video ID.
  
  Parameters:
  -----------
  id : str
    The unique identifier for the YouTube video.
  
  Returns:
  --------
  str
    A JSON-formatted string containing information about the video, including its ID,
    title, publication date, channel, view count, like count, and original length.
  """
  youtube = build(YOUTUBE_API_SERVICE_NAME, YOUTUBE_API_VERSION,
    developerKey=DEVELOPER_KEY)

  # QUERIES BASED ON A LINK --> todo
  results = youtube.videos().list(
    id=id,
    part='snippet,contentDetails,statistics'
  ).execute()

  # just send videos for now
  vidData = results.get('items', [])[0]
  data = {
    'id': vidData['id'],
    'title': vidData['snippet']['title'],
    'publishedAt': vidData['snippet']['publishedAt'],
    'channel': vidData['snippet']['channelTitle'],
    'viewCount': vidData['statistics']['viewCount'],
    'likeCount': vidData['statistics']['likeCount'],
    'originalLength': vidData['contentDetails']['duration']
  }
  return json.dumps(data)

access_key = os.environ.get("ACCESS_ID")
access_secret = os.environ.get("ACCESS_KEY")

# write to s3 bucket 
def write_to_bucket(out_dir, filename):
  """
  Uploads a provided video to an AWS S3 bucket with public-read access.

  Parameters:
  -----------
  out_dir : str
    The path to the directory containing the file to be uploaded.
  filename : str
    The name of the file to be uploaded.
  """
   # Set up the client for the AWS S3 service
  s3 = boto3.client('s3', aws_access_key_id=access_key, aws_secret_access_key=access_secret)   
  bucket_name = 'cur8-vids' # us-west-2

  with open(out_dir + '/' + filename, 'rb') as file:
    print('starting upload to s3 bucket')
    s3.upload_fileobj(file, bucket_name, filename, ExtraArgs={'ACL': 'public-read', 'ContentType': 'binary/octet-stream'})
    print('success uploading to s3!')

# read from s3 bucket
def read_from_bucket(filename):
  """
  Generates a pre-signed URL for a video stored in an AWS S3 bucket.

  Parameters:
  -----------
  filename : str
    The name of the video stored in the S3 bucket.

  Returns:
  --------
  str
    A pre-signed URL that can be used to access the video in the S3 bucket.
  """
  s3 = boto3.client('s3', aws_access_key_id=access_key, aws_secret_access_key=access_secret)
  bucket_name = 'cur8-vids'
  url = s3.generate_presigned_url('get_object', Params={'Bucket': bucket_name, 'Key': filename})
  return url

# delete obj from s3 bucket
def delete_from_bucket(filename):
  """
  Deletes a file from an AWS S3 bucket.

  Parameters:
  -----------
  filename : str
    The name of the video to be deleted from the S3 bucket.
  """
  s3 = boto3.resource('s3', aws_access_key_id=access_key, aws_secret_access_key=access_secret)
  s3.Object('cur8-vids', filename).delete()

def download_top_n(query, n, out_dir):
    """
    Downloads the top n videos from YouTube based on the specified query string, 
    saves the videos to a local directory, uploads them to an S3 bucket, 
    and returns a list of the video IDs that were downloaded.

    Parameters:
    -----------
    query : str
      The query string used to search for videos on YouTube.
    n (int) : str
      The number of videos to download.
    out_dir : str
      The directory where the downloaded videos will be saved.

    Returns:
    --------
    list
      A list of video IDs that were downloaded.
    """

    # indicates link
    if '=' in query:
       urls = [query]
    else:
      urls = youtube_search_query(query)[:50]
    
    video_ids = []
    
    for url in urls:
        videoId = url.split('=')[-1]
        youtubeObject = YouTube(url)

        response = requests.get(f'https://yt.lemnoslife.com/videos?part=mostReplayed&id={videoId}').json()
        # print("RESPONSE MOSTREPLAYED?: " + str(response["items"][0]["mostReplayed"]))

        youtubeObject = youtubeObject.streams.get_highest_resolution()

        if response["items"][0]["mostReplayed"] != None:
          video_ids.append(videoId)
          youtubeObject.download(output_path=out_dir, filename=f'raw-{videoId}.mp4')
          write_to_bucket(out_dir, filename=f'raw-{videoId}.mp4')
          final_path = os.path.join(out_dir, f'raw-{videoId}.mp4') 
          os.remove(final_path) # remove video path

        if len(video_ids) == n:
           break

    # print("VIDEO IDs: " + str(video_ids))
    
    return video_ids

# get most replayed clips from video
def aggregate_most_replayed_clips(heat_marker_data, top_n_clips = 3, min_clip_gap = 40, pm_buffer = 20):
    """
    Aggregates the most replayed clips in a YouTube video based on their heat marker data
    and provides a list of timestamps of those clips.

    Parameters:
    -----------
    heat_marker_data : list
      List containing heat marker data for current video
    top_n_clips : int
      Maximum number of clips to return, default to 3
    min_clip_gap : int
      Minimum number of seconds between different clips, default to 40
    pm_buffer : int
      Number of seconds to add around each clips, default to 20
    
    Returns:
    --------
    List
      List of clips, each containing start and end timestamp of video
    """
    heat_marker_data_sorted = heat_marker_data[heat_marker_data[:, 2].argsort()][::-1]
    video_len = np.max(heat_marker_data_sorted[:,0])
    clips = []
    for split in heat_marker_data_sorted:

        start_time, duration, score = split
        end_time = start_time + duration
        
        
        start_time = max(0, start_time - pm_buffer)
        end_time = min(end_time + pm_buffer, video_len)
        
        if start_time == 0.0:
            continue

        combined = False

        if len(clips) > 0:
            for clip in clips:
                processed_start_time, processed_end_time = clip
                if (
                    abs(start_time - processed_end_time) < min_clip_gap or 
                    abs(end_time - processed_start_time) < min_clip_gap or
                    abs(start_time > processed_start_time and start_time < processed_end_time) or
                    abs(end_time < processed_end_time and end_time > processed_start_time)) :

                    clip[0] = min(start_time, processed_start_time)
                    clip[1] = max(end_time, processed_end_time)

                    combined = True
                    break 

        if not combined:
            clips.append([start_time, end_time])

        if len(clips) == top_n_clips:
            break
    
    return clips

def get_most_replayed_clips(video_id, top_n_clips = 3, min_clip_gap = 20, pm_buffer = 10):
    """
    Set up heat marker data for a particular video to pass to aggregate_most_replayed_clips

    Parameters:
    -----------
    video_id : str
      The ID of the YouTube video to retrieve the most replayed clips for.
    top_n_clips : int
      The maximum number of clips to return.
    min_clip_gap : int
      The minimum time gap (in seconds) between adjacent clips.
    pm_buffer : int
      The time buffer (in seconds) to add before and after each clip.

    Returns:
    --------
    List
        A list of lists, where each sublist represents a clip and contains its 
        start and end times in seconds. Returns False if the video does not have 
        any most replayed clips.
    """
    response = requests.get(f'https://yt.lemnoslife.com/videos?part=mostReplayed&id={video_id}').json()
    print("RESPONSE")
    print(response)

    if response['items'][0]["mostReplayed"] == None:
        return False

    heat_markers = response['items'][0]["mostReplayed"]["heatMarkers"]
    heat_marker_data = np.array([np.array([heat_markers[i]['heatMarkerRenderer']['timeRangeStartMillis']*0.001, 
                     heat_markers[i]['heatMarkerRenderer']['markerDurationMillis']*0.001, 
                     heat_markers[i]['heatMarkerRenderer']['heatMarkerIntensityScoreNormalized']]) for i in range(len(heat_markers))])
    
    clips = aggregate_most_replayed_clips(heat_marker_data, top_n_clips, min_clip_gap, pm_buffer)
    return clips

@app.route('/vidclip', methods=["POST"])
def generate_compilation(out_dir = 'hilites'):
  """
  Downloads the top num_vids videos matching the query, processes each video 
  to extract the most replayed clips, concatenates the clips into a single video, 
  and returns the path of the final video file and its metadata.

  Parameters:
  -----------
  out_dir : str
    Path of the directory where the video files will be saved, default to 'hilites'

  Returns:
  --------
  JSON object including clip path filename, metadata of first video in list, and any errors
  """
  out_dir = os.path.join(os.getcwd(), out_dir)
  if not os.path.isdir(out_dir):
    os.mkdir(out_dir)

  data = json.loads(request.data)
  query = data["query"]
  num_vids = int(data["numVids"])
  # print("QUERY: " + str(query) + "\nNUM VIDS: " + str(num_vids))
  video_ids = download_top_n(query, num_vids, out_dir)
  if len(video_ids) == 0:
     return flask.jsonify({ 'error': True } )

  metadata = youtube_search_id(video_ids[0])
  video_clips = []
  
  for video_id in video_ids:
      print("processing {}".format(video_id))

      # fname = glob.glob(os.path.join(out_dir, f'{video_id}.mp4'))[0]
      # print("FNAME: " + str(fname))

      clips = get_most_replayed_clips(video_id)

      # fname = glob.glob(os.path.join(out_dddir, f'{video_id}.mp4/*.mp4'))[0]

      for i, clip in enumerate(clips):
          start, end = clip
          print("clip ", i, " ", start, ":", end)
          current_clip = VideoFileClip(read_from_bucket(f'raw-{video_id}.mp4'))
          current_subclip = current_clip.subclip(start, end)
          video_clips.append(current_subclip)

  final_clip = concatenate_videoclips(video_clips)
  final_clip_output_fname = os.path.join(out_dir, f"{video_id}_concat.mp4")
  final_clip.write_videofile(final_clip_output_fname,  
                              temp_audiofile="temp-audio.m4a", 
                              remove_temp=True, 
                              codec="libx264", 
                              audio_codec="aac")
  write_to_bucket(out_dir, f"{video_id}_concat.mp4")
  loc = read_from_bucket(f"{video_id}_concat.mp4")
  delete_from_bucket(f"raw-{video_id}.mp4")
  # loc = final_clip_output_fname.split("\\")[-2] + "\\" + final_clip_output_fname.split("\\")[-1]
  response = flask.jsonify(
    {'clipPath': loc, 
    'metadata': metadata,
    'error': False,
  })
  return response

# START SUMMARIZATION

import openai
from dotenv import load_dotenv
import os
from youtube_transcript_api import YouTubeTranscriptApi
import re
from typing import List

load_dotenv()
api_key = os.environ.get("OPENAI_API_KEY")
openai.api_key = api_key

def split_text_into_chunks(text: str) -> List[str]:
    """
    Splits a given text into smaller chunks, each containing at most 300 words.

    Parameters:
    -----------
    text : str
      the input text to be split
    
    Returns:
    --------
    List[str]
      a list of strings, each representing a chunk of the original text

    The function first splits the input text into individual sentences by looking for periods.
    It then combines sentences into chunks, where each chunk contains as many sentences as possible
    without exceeding the maximum word count of 300. If adding a sentence would make the current chunk
    too long, the function starts a new chunk.

    Note: function assumes that sentences in the input text are separated by periods and do not contain
    other punctuation marks that could indicate the end of a sentence.
    """
    MAX_WORDS_PER_CHUNK = 300
    sentences = text.split('.') # split input text into sentences
    chunks = []

    current_chunk = ''
    current_word_count = 0

    for sentence in sentences:
        words = sentence.strip().split(' ')
        word_count = len(words)

        # If adding this sentence to the current chunk would make the chunk too long,
        # start a new chunk
        if current_word_count + word_count > MAX_WORDS_PER_CHUNK:
            chunks.append(current_chunk)
            current_chunk = ''
            current_word_count = 0

        # Add the sentence to the current chunk
        current_chunk += sentence + '.'
        current_word_count += word_count

    # Add any remaining text as the final chunk
    if len(current_chunk) > 0:
        chunks.append(current_chunk)

    return chunks

def get_video_captions(video_id):
    """
    Takes a YouTube video ID and returns the full text transcription of the video in English.

    Parameters:
    -----------
    video_id : str
      Unique ID of YouTube video
  
    Returns:
    --------
    str
      Transcription of new video
    """
    transcriptItems = YouTubeTranscriptApi.get_transcript(video_id,
                                            languages=['en'])
    fullText = ''
    for item in transcriptItems:
        fullText += re.sub(r"(\r\n|\n|\r)", "", item['text']) + " "
    return fullText


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

#chat gpt summarization
def chat_gpt_call(chunks):
  """
  takes a list of text chunks and summarizes each chunk into a short bullet point list 
  of key points and takeaways using the OpenAI GPT-3.5 Turbo model.
  
  Parameters:
  -----------
  chunks : list
    List of word chunks to be summarized
  
  Returns:
  --------
  str
    String containing summary of each chunk with bullet point and line breaks separating
    key points and takeaways
  """
  promptQuestion = "Summarize the following text with the most important and helpful points, into a short bullet point list of key points and takeaways without giving a header:\n"
  responses = ""
  for chunk in chunks:
    msg = promptQuestion + chunk
    print(msg)
    res = openai.ChatCompletion.create(
      model="gpt-3.5-turbo",
      messages=[
            {"role": "user", "content": msg},
        ]
    )
    responses += res['choices'][0]['message']['content'].strip(" \n") + "\n"
  return responses

@app.route('/vidsummary', methods=["POST"])
def make_summary():
  data = json.loads(request.data)
  url = data["query"]
  video_id = url.split('=')[-1]
  fullText = get_video_captions(video_id)
  chunks = split_text_into_chunks(fullText)
  bullets = chat_gpt_call(chunks)
  response = flask.jsonify({'text': bullets })
  return response


# base
@app.route('/')
def index():
  # return send_from_directory(app.static_folder, 'index.html')
  return "I'm just the server mate"


# runs flask app
if __name__ == '__main__':
  app.run(debug=True)
