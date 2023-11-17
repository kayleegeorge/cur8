import os
from dotenv import load_dotenv
import moviepy
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from flask import Flask, request
from flask_restful import reqparse, Api, Resource
import json
from flask_cors import CORS
import flask
import glob
from moviepy.editor import VideoFileClip, concatenate_videoclips
app = Flask(__name__)
api = Api(app)
cors = CORS(app, resources={r"/vids": {"origins": "*"}})
from pytube import YouTube 
import cv2
import requests
import numpy as np

load_dotenv()

# Set DEVELOPER_KEY to the API key value from the APIs & auth > Registered apps
# tab of
#   https://cloud.google.com/console
# Please ensure that you have enabled the YouTube Data API for your project.
DEVELOPER_KEY = 'AIzaSyCq6rR1L3qoRQxHCR2J9WGB1Eg4XAT_ClM'
YOUTUBE_API_SERVICE_NAME = 'youtube'
YOUTUBE_API_VERSION = 'v3'

def youtube_search(query):
    youtube = build(YOUTUBE_API_SERVICE_NAME, YOUTUBE_API_VERSION,
    developerKey=DEVELOPER_KEY)

    # Call the search.list method to retrieve results matching the specified
    # query term.
    search_response = youtube.search().list(
    q=query,
    part='id,snippet',
    maxResults=10 # can change this
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

def download_top_n(query, n, output = './'):
    urls = youtube_search(query)[:n]
    video_ids = []
    
    for url in urls:
        videoId = url.split('=')[-1]
        youtubeObject = YouTube(url)
        youtubeObject = youtubeObject.streams.get_highest_resolution()
        video_ids.append(videoId)
        youtubeObject.download(f'{videoId}.mp4')
    
    return video_ids

def aggregate_most_replayed_clips(heat_marker_data, top_n_clips = 3, min_clip_gap = 40, pm_buffer = 10):
    
    heat_marker_data_sorted = heat_marker_data[heat_marker_data[:, 2].argsort()][::-1]
    video_len = heat_marker_data_sorted[-1][0] + heat_marker_data_sorted[-1][1]
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
                    abs(end_time < processed_end_time and end_time > processed_start_time)):

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
    response = requests.get(f'https://yt.lemnoslife.com/videos?part=mostReplayed&id={video_id}').json()
    
    heat_markers = response['items'][0]["mostReplayed"]["heatMarkers"]
    heat_marker_data = np.array([np.array([heat_markers[i]['heatMarkerRenderer']['timeRangeStartMillis']*0.001, 
                     heat_markers[i]['heatMarkerRenderer']['markerDurationMillis']*0.001, 
                     heat_markers[i]['heatMarkerRenderer']['heatMarkerIntensityScoreNormalized']]) for i in range(len(heat_markers))])
    
    clips = aggregate_most_replayed_clips(heat_marker_data, top_n_clips, min_clip_gap, pm_buffer)
    return clips

def generate_compilation(query, 
                        num_vids = 1):
    video_ids = download_top_n(query, num_vids)
    video_clips = []

    for video_id in video_ids:
        print("processing {}".format(video_id))
        clips = get_most_replayed_clips(video_id)

        fname = glob.glob(os.path.join(os.getcwd(), f'{video_id}.mp4/*.mp4'))[0]

        for i, clip in enumerate(clips):
            start, end = clip
            current_clip = VideoFileClip(fname)
            current_subclip = current_clip.subclip(start, end)
            video_clips.append(current_subclip)

        final_clip = concatenate_videoclips(video_clips)
        final_clip_output_fname = f"{video_id}_concat.mp4"
        final_clip.write_videofile(final_clip_output_fname,  
                                   temp_audiofile="temp-audio.m4a", 
                                   remove_temp=True, 
                                   codec="libx264", 
                                   audio_codec="aac")
        return final_clip_output_fname

# runs flask app
if __name__ == '__main__':
  app.run(debug=True)
