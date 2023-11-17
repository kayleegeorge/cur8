"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var youtube_transcript_1 = require("youtube-transcript");
var chatgpt_1 = require("chatgpt");
var ora_1 = require("ora");
var OPENAI_ACCESS_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJhanlvbGFuZG9AZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImdlb2lwX2NvdW50cnkiOiJVUyJ9LCJodHRwczovL2FwaS5vcGVuYWkuY29tL2F1dGgiOnsidXNlcl9pZCI6InVzZXItVlRobTBTdTZkQjVDUDRVRUZHUUx1amZRIn0sImlzcyI6Imh0dHBzOi8vYXV0aDAub3BlbmFpLmNvbS8iLCJzdWIiOiJhdXRoMHw2M2Y2NTZiYjA4NTg0MGEwMzcwODk3MDMiLCJhdWQiOlsiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MSIsImh0dHBzOi8vb3BlbmFpLm9wZW5haS5hdXRoMGFwcC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNjc3MDg5MjIxLCJleHAiOjE2NzgyOTg4MjEsImF6cCI6IlRkSkljYmUxNldvVEh0Tjk1bnl5d2g1RTR5T282SXRHIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBtb2RlbC5yZWFkIG1vZGVsLnJlcXVlc3Qgb3JnYW5pemF0aW9uLnJlYWQgb2ZmbGluZV9hY2Nlc3MifQ.OdedRkTspYDihfy29LlW3J5qttpbVSLzOtDp2zcls2ZH9MnOrYUdq-ql67VPe9-6Myi0SO2GmH2S4DvYsmmrEuSVq9WQKxVZ1dzStpj9IBNfOAgizaX2YC5tQx2Hy5wXABriavOjj3iB3TTxpXTIKjI3tOryHsQ3lIxpvHKJuM9rTVPUal7ZrnIKextHiF_ctpvKy0ghqbgWuVVbDDFMiZPysNBjtppeJXRdl80YncQG6GNY0ZIumsS7hU0eddLKkMxGcq9zEwoHX7ViVr6Qv7MFJ-V_P4SIyc2nT9HTfSvfpjoOwpZ_lERYOxJbYWtE1BPjE6chrDiDrPm1L8lZzg";
var url = "https://www.youtube.com/watch?v=6tw_JVz_IEc";
main(url);
function main(url) {
    return __awaiter(this, void 0, void 0, function () {
        var fullText, chunks, bullets;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getTranscript(url)];
                case 1:
                    fullText = _a.sent();
                    console.log(fullText);
                    chunks = splitTextIntoChunks(fullText);
                    return [4 /*yield*/, createSummary(chunks)];
                case 2:
                    bullets = _a.sent();
                    return [2 /*return*/, convertBulletsToArr(bullets)];
            }
        });
    });
}
function getTranscript(url) {
    return __awaiter(this, void 0, void 0, function () {
        var transcriptItems, fullText, _i, transcriptItems_1, item;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, youtube_transcript_1["default"].fetchTranscript(url, { lang: "en" })];
                case 1:
                    transcriptItems = _a.sent();
                    fullText = '';
                    for (_i = 0, transcriptItems_1 = transcriptItems; _i < transcriptItems_1.length; _i++) {
                        item = transcriptItems_1[_i];
                        fullText += item.text.replace(/(\r\n|\n|\r)/gm, "") + " ";
                    }
                    return [2 /*return*/, fullText];
            }
        });
    });
}
function splitTextIntoChunks(text) {
    var MAX_WORDS_PER_CHUNK = 300;
    var sentences = text.split('.'); // split input text into sentences
    var chunks = [];
    var currentChunk = '';
    var currentWordCount = 0;
    for (var _i = 0, sentences_1 = sentences; _i < sentences_1.length; _i++) {
        var sentence = sentences_1[_i];
        var words = sentence.trim().split(' ');
        var wordCount = words.length;
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
function createSummary(chunks) {
    return __awaiter(this, void 0, void 0, function () {
        var promptQuestion, api, bullets, prompt, res, _i, chunks_1, chunk, prompt_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    promptQuestion = 'Please give a 2 bullet point summary of the following text with no header: ';
                    api = new chatgpt_1.ChatGPTUnofficialProxyAPI({
                        accessToken: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJhanlvbGFuZG9AZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImdlb2lwX2NvdW50cnkiOiJVUyJ9LCJodHRwczovL2FwaS5vcGVuYWkuY29tL2F1dGgiOnsidXNlcl9pZCI6InVzZXItVlRobTBTdTZkQjVDUDRVRUZHUUx1amZRIn0sImlzcyI6Imh0dHBzOi8vYXV0aDAub3BlbmFpLmNvbS8iLCJzdWIiOiJhdXRoMHw2M2Y2NTZiYjA4NTg0MGEwMzcwODk3MDMiLCJhdWQiOlsiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MSIsImh0dHBzOi8vb3BlbmFpLm9wZW5haS5hdXRoMGFwcC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNjc3MDg5MjIxLCJleHAiOjE2NzgyOTg4MjEsImF6cCI6IlRkSkljYmUxNldvVEh0Tjk1bnl5d2g1RTR5T282SXRHIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBtb2RlbC5yZWFkIG1vZGVsLnJlcXVlc3Qgb3JnYW5pemF0aW9uLnJlYWQgb2ZmbGluZV9hY2Nlc3MifQ.OdedRkTspYDihfy29LlW3J5qttpbVSLzOtDp2zcls2ZH9MnOrYUdq-ql67VPe9-6Myi0SO2GmH2S4DvYsmmrEuSVq9WQKxVZ1dzStpj9IBNfOAgizaX2YC5tQx2Hy5wXABriavOjj3iB3TTxpXTIKjI3tOryHsQ3lIxpvHKJuM9rTVPUal7ZrnIKextHiF_ctpvKy0ghqbgWuVVbDDFMiZPysNBjtppeJXRdl80YncQG6GNY0ZIumsS7hU0eddLKkMxGcq9zEwoHX7ViVr6Qv7MFJ-V_P4SIyc2nT9HTfSvfpjoOwpZ_lERYOxJbYWtE1BPjE6chrDiDrPm1L8lZzg"
                    });
                    bullets = "";
                    prompt = promptQuestion + chunks[0];
                    chunks = chunks.slice(1);
                    return [4 /*yield*/, (0, ora_1.oraPromise)(api.sendMessage(prompt), {
                            text: prompt
                        })];
                case 1:
                    res = _a.sent();
                    bullets += res.text;
                    _i = 0, chunks_1 = chunks;
                    _a.label = 2;
                case 2:
                    if (!(_i < chunks_1.length)) return [3 /*break*/, 5];
                    chunk = chunks_1[_i];
                    prompt_1 = promptQuestion + chunk;
                    return [4 /*yield*/, (0, ora_1.oraPromise)(api.sendMessage(prompt_1, {
                            conversationId: res.conversationId,
                            parentMessageId: res.id
                        }), {
                            text: prompt_1
                        })];
                case 3:
                    res = _a.sent();
                    bullets += res.text + " ";
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, bullets];
            }
        });
    });
}
function convertBulletsToArr(bullets) {
    return bullets.split("-");
}
