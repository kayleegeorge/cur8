import YoutubeTranscript from "youtube-transcript";
import { ChatGPTUnofficialProxyAPI } from 'chatgpt'
import { oraPromise } from 'ora'


var OPENAI_ACCESS_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJhanlvbGFuZG9AZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImdlb2lwX2NvdW50cnkiOiJVUyJ9LCJodHRwczovL2FwaS5vcGVuYWkuY29tL2F1dGgiOnsidXNlcl9pZCI6InVzZXItVlRobTBTdTZkQjVDUDRVRUZHUUx1amZRIn0sImlzcyI6Imh0dHBzOi8vYXV0aDAub3BlbmFpLmNvbS8iLCJzdWIiOiJhdXRoMHw2M2Y2NTZiYjA4NTg0MGEwMzcwODk3MDMiLCJhdWQiOlsiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MSIsImh0dHBzOi8vb3BlbmFpLm9wZW5haS5hdXRoMGFwcC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNjc3MDg5MjIxLCJleHAiOjE2NzgyOTg4MjEsImF6cCI6IlRkSkljYmUxNldvVEh0Tjk1bnl5d2g1RTR5T282SXRHIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBtb2RlbC5yZWFkIG1vZGVsLnJlcXVlc3Qgb3JnYW5pemF0aW9uLnJlYWQgb2ZmbGluZV9hY2Nlc3MifQ.OdedRkTspYDihfy29LlW3J5qttpbVSLzOtDp2zcls2ZH9MnOrYUdq-ql67VPe9-6Myi0SO2GmH2S4DvYsmmrEuSVq9WQKxVZ1dzStpj9IBNfOAgizaX2YC5tQx2Hy5wXABriavOjj3iB3TTxpXTIKjI3tOryHsQ3lIxpvHKJuM9rTVPUal7ZrnIKextHiF_ctpvKy0ghqbgWuVVbDDFMiZPysNBjtppeJXRdl80YncQG6GNY0ZIumsS7hU0eddLKkMxGcq9zEwoHX7ViVr6Qv7MFJ-V_P4SIyc2nT9HTfSvfpjoOwpZ_lERYOxJbYWtE1BPjE6chrDiDrPm1L8lZzg"


let url = "https://www.youtube.com/watch?v=6tw_JVz_IEc"

main(url);
async function main(url: string): Promise<string[]> {
    let fullText = await getTranscript(url);
    console.log(fullText);
    let chunks = splitTextIntoChunks(fullText);
    let bullets = await createSummary(chunks);
    return convertBulletsToArr(bullets)
}

async function getTranscript(url: string): Promise<string> {
    const transcriptItems = await YoutubeTranscript.fetchTranscript(url, {lang:"en"});
    let fullText = '';
    for (const item of transcriptItems) {
        fullText += item.text.replace(/(\r\n|\n|\r)/gm, "") + " ";
    }
    return fullText;
}


function splitTextIntoChunks(text: string): string[] {
    const MAX_WORDS_PER_CHUNK = 300;
    const sentences = text.split('.'); // split input text into sentences
    const chunks: string[] = [];

    let currentChunk = '';
    let currentWordCount = 0;

    for (const sentence of sentences) {
        const words = sentence.trim().split(' ');
        const wordCount = words.length;

        // If adding this sentence to the current chunk would make the chunk too long,
        // start a new chunk
        if (currentWordCount + wordCount > MAX_WORDS_PER_CHUNK) {
            chunks.push(currentChunk);
            currentChunk = '';
            currentWordCount = 0;
        }

        // Add the sentence to the current chunk
        currentChunk += sentence + '.';
        currentWordCount += wordCount;
    }

    // Add any remaining text as the final chunk
    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }
    return chunks;
}

async function createSummary(chunks: string[]): Promise<string> {
    let promptQuestion = 'Please give a 2 bullet point summary of the following text with no header: ';
    const api = new ChatGPTUnofficialProxyAPI({
        accessToken: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJhanlvbGFuZG9AZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImdlb2lwX2NvdW50cnkiOiJVUyJ9LCJodHRwczovL2FwaS5vcGVuYWkuY29tL2F1dGgiOnsidXNlcl9pZCI6InVzZXItVlRobTBTdTZkQjVDUDRVRUZHUUx1amZRIn0sImlzcyI6Imh0dHBzOi8vYXV0aDAub3BlbmFpLmNvbS8iLCJzdWIiOiJhdXRoMHw2M2Y2NTZiYjA4NTg0MGEwMzcwODk3MDMiLCJhdWQiOlsiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MSIsImh0dHBzOi8vb3BlbmFpLm9wZW5haS5hdXRoMGFwcC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNjc3MDg5MjIxLCJleHAiOjE2NzgyOTg4MjEsImF6cCI6IlRkSkljYmUxNldvVEh0Tjk1bnl5d2g1RTR5T282SXRHIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBtb2RlbC5yZWFkIG1vZGVsLnJlcXVlc3Qgb3JnYW5pemF0aW9uLnJlYWQgb2ZmbGluZV9hY2Nlc3MifQ.OdedRkTspYDihfy29LlW3J5qttpbVSLzOtDp2zcls2ZH9MnOrYUdq-ql67VPe9-6Myi0SO2GmH2S4DvYsmmrEuSVq9WQKxVZ1dzStpj9IBNfOAgizaX2YC5tQx2Hy5wXABriavOjj3iB3TTxpXTIKjI3tOryHsQ3lIxpvHKJuM9rTVPUal7ZrnIKextHiF_ctpvKy0ghqbgWuVVbDDFMiZPysNBjtppeJXRdl80YncQG6GNY0ZIumsS7hU0eddLKkMxGcq9zEwoHX7ViVr6Qv7MFJ-V_P4SIyc2nT9HTfSvfpjoOwpZ_lERYOxJbYWtE1BPjE6chrDiDrPm1L8lZzg"
    })
    var bullets = "";

    var prompt = promptQuestion + chunks[0];
    chunks = chunks.slice(1);
    var res = await oraPromise(api.sendMessage(prompt), {
        text: prompt
    })

    bullets += res.text;
    for (const chunk of chunks) {
        let prompt = promptQuestion + chunk
        res = await oraPromise(api.sendMessage(prompt, {
            conversationId: res.conversationId,
            parentMessageId: res.id
        }),
            {
                text: prompt
            }
        )
        bullets += res.text + " ";
    }
    return bullets;
}

function convertBulletsToArr(bullets:string): string[] {
    return bullets.split("-")
}