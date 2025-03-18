import React, { Fragment, useEffect, useState } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import Search from "../pages/search";
import {
    gAPI_THREAD_SUMMARY, post_API_CREATE_TICKET, gAPI_THREAD_DYNAMIC_SUMMARY,
    API_EMAIL_STATS
} from "./../../constants/api";
import loader from "../../assets/images/plugin_loader.gif";
import Reply from "../components/Reply";
import Help from "../components/Help";
import moment from "moment";

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const Main = ({ gid, pid, iid, propertyDetails, locale, emailIntegration, questionSetDetails, authContext }) => {
    const [reply, setReply] = useState('');
    const [page, setPage] = useState('main');
    const [threadResponse, setThreadResponse] = useState();
    const [loading, setLoading] = useState(false);
    const [threadLoading, setThreadLoading] = useState(true);
    const [responseList, setResponseList] = useState([]);
    const [cid, setCID] = useState(generateUUID() || '');
    const [statsId, setStatsId] = useState();
    const [mailStatsChange, setMailStatsChange] = useState({
        pasteToOutlook: false, replyGenerated: false, copyDraft: false
    });
    function mailContextChange() {
        Office.context.mailbox.item.body.getAsync(Office.CoercionType.Text, function (bodyTtext) {
            if (questionSetDetails !== undefined) {
                setPage('main');
                let tools = [];
                if (questionSetDetails?.flowInvokeApi && questionSetDetails.flowInvokeApi?.isEnabled == true)
                    tools = questionSetDetails.flowInvokeApi?.json;
                handleSummary(bodyTtext['value'], questionSetDetails?.instructions, tools, gAPI_THREAD_DYNAMIC_SUMMARY);
            } else if (emailIntegration !== undefined) {
                setPage('main');
                let flow = result?.channelDetails && result?.channelDetails?.autonomousReplies;
                handleSummary(bodyTtext['value'], flow?.instructions, [], gAPI_THREAD_SUMMARY);
            }
        });
    }

    const handleManage = async (type, resposne) => {
        switch (type) {
            case 'reply':
                if (resposne !== '')
                    setReply(resposne);
                return;
            case 'threadSummary':
                handleSummary(resposne);
                return;
            case 'page':
                setPage(resposne);
                return;
            case 'responseList':
                setResponseList(resposne);
                return;
            case 'sendReply':
                await Office.context.mailbox.item.displayReplyAllFormAsync(resposne);
                return;
            case 'updateStats':
                setMailStatsChange(resposne);               
                return;
        }
    }

    const handleSummary = (text, systemInstructions, tools, url) => {
        setThreadResponse();
        setThreadLoading(true);
        let properties = {
            "customer_sentiment": {
                "type": "string",
                "description": "Sentiment of the customer in the email",
                "enum": [
                    "Positive",
                    "Neutral",
                    "Negative"
                ]
            },
            "priority": {
                "type": "string",
                "description": "Priority of the email",
                "enum": [
                    "High",
                    "Medium",
                    "Low"
                ]
            },
            "email_history": {
                "type": "object",
                "required": [
                    "FirstMessage",
                    "LastMessage",
                    "ThreadCount"
                ],
                "properties": {
                    "FirstMessage": {
                        "type": "string",
                        "description": "Date and time of the first message in the email thread in ISO 8601 format"
                    },
                    "LastMessage": {
                        "type": "string",
                        "description": "Date and time of the latest message in the email thread in ISO 8601 format"
                    },
                    "ThreadCount": {
                        "type": "string",
                        "description": "Total number of threads in the email"
                    }
                },
                "additionalProperties": false
            },
            "summary": {
                "type": "string",
                "description": "Short summary of the email"
            },
            "language": {
                "type": "string",
                "description": "ISO language code of the customer email"
            },
            "topics": {
                "type": "string",
                "description": "Topic of the email",
                "enum": emailIntegration?.channelDetails?.topics?.topicName || [
                    "New Reservation",
                    "Existing Reservation",
                    "Lost & Found",
                    "General Inquiry",
                    "Group Inquiry",
                    "Pre-Arrival Message"
                ]
            }
        };
        let required = [
            "customer_sentiment",
            "priority",
            "email_history",
            "summary",
            "topics",
            "language"
        ];
        fetch(url,
            {
                method: "Post",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "groupId": gid,
                    "propertyId": pid,
                    "language": "en", "q": "", "suffix": "",
                    "conversationId": cid,
                    "propertyName": propertyDetails?.name,
                    "modelName": "gpt-4o-mini",
                    "history": [{ "human": text }],
                    "systemInstructions": systemInstructions,
                    "tools": tools,
                    "properties": properties,
                    "required": required,
                    "response_format": {
                        "name": "message_response",
                        "description": "Summarizes the email thread including sentiment, thread count, and topics discussed.",
                        "strict": false,
                        "schema": {
                            "type": "object",
                            "properties": properties,
                            "required": required
                        },
                        "additionalProperties": false
                    }
                })
            }).then(res => res.json()).then(async (result) => {
                if (result.arguments !== undefined) {
                    setThreadLoading(false);
                    let data = JSON.parse(result.arguments);
                    setThreadResponse(data);
                }
            }).catch(err => {
                console.log(144, pid);
            });
    }

    const handleReplyPage = () => {
        setPage('reply');
        setMailStatsChange({ ...mailStatsChange, replyGenerated: true });
    }

    const handleTicket = () => {
        fetch(post_API_CREATE_TICKET,
            {
                method: "Post",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(
                    {
                        "notes": threadResponse?.summary,
                        "tags": ["Query"],
                        "creator": "OutlookPlugin",
                        "Source": "OutlookPlugin",
                        "conversationId": cid,
                        "propertyId": pid,
                        "groupId": gid,
                        "status": "Pending",
                        "type": null,
                        "title": "Query",
                        "assignTo": "vivek@myma.ai",
                        "statusNotes": [
                            { "assignEmail": "vivek@myma.ai", "text": "Assigned to vivek@myma.ai", "createdBy": "vivek@bookmebob.com" },
                        ]
                    }
                ),
            }).then(res => res.json()).then((result) => {
                console.log(result);
            });

    }

    useEffect(() => {
        Office.context.mailbox.addHandlerAsync(Office.EventType.ItemChanged, mailContextChange);
        Office.context.mailbox.item.body.getAsync(Office.CoercionType.Text, function (bodyTtext) {
            if (emailIntegration !== undefined) {
                if (questionSetDetails !== undefined) {
                    let tools = [];
                    if (questionSetDetails?.flowInvokeApi && questionSetDetails.flowInvokeApi?.isEnabled == true)
                        tools = questionSetDetails.flowInvokeApi?.json;
                    console.log(166, questionSetDetails);
                    handleSummary(bodyTtext['value'], questionSetDetails?.instructions, tools, gAPI_THREAD_DYNAMIC_SUMMARY);
                } else {
                    let flow = emailIntegration?.channelDetails && emailIntegration?.channelDetails?.autonomousReplies;
                    handleSummary(bodyTtext['value'], flow?.instructions, [], gAPI_THREAD_SUMMARY);
                }
            }
        });
    }, [pid]);


    useEffect(() => {
        if (threadResponse !== undefined)
            AddStats();
    }, [threadResponse]);

    useEffect(() => {
        if (threadResponse !== undefined)
            updateStats(mailStatsChange?.pasteToOutlook, mailStatsChange?.replyGenerated, mailStatsChange?.copyDraft);
    }, [mailStatsChange]);    

    function AddStats(pasteToOutlook = false, replyGenerated = false, copyDraft = false) {
        fetch(API_EMAIL_STATS,
            {
                method: "Post",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "integrationId": iid,
                    "groupId": gid,
                    "propertyId": pid,
                    "email": authContext?.userPrincipalName,
                    "threadSummary": threadResponse?.summary,
                    "topic": (threadResponse?.topics),
                    "urgency": threadResponse?.priority,
                    "type": "plugin",
                    "sentiment": threadResponse?.customer_sentiment,
                    "pasteToOutlook": pasteToOutlook,
                    "replyGenerated": replyGenerated,
                    "copyDraft": copyDraft,
                })
            }).then(res => res.json()).then((result) => {
                if (result?.status)
                    setStatsId(result.status);
            }).catch(err => {
                console.log(144, pid);
            });
    }

    function updateStats(pasteToOutlook = false, replyGenerated = false, copyDraft = false) {
        fetch(`${API_EMAIL_STATS}/${statsId}`,
            {
                method: "put",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "email": authContext?.userPrincipalName,
                    "threadSummary": threadResponse?.summary,
                    "topic": (threadResponse?.topics),
                    "Urgency": threadResponse?.priority,
                    "type": "plugin",
                    "sentiment": threadResponse?.customer_sentiment,
                    "pasteToOutlook": pasteToOutlook,
                    "replyGenerated": replyGenerated,
                    "copyDraft": copyDraft,
                })
            }).then(res => res.json()).then((result) => {                
            }).catch(err => {                
            });
    }

    function getExpression(sentiment) {
        var svg;
        if (sentiment === "Positive") {
            svg = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width={20} height={20} >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
            </svg>
                ;
        } else if (sentiment === "Neutral") {
            svg = <svg version='1.0' xmlns='http://www.w3.org/2000/svg' width={20} height={20} className="yellow" viewBox='0 0 512.000000 512.000000' preserveAspectRatio='xMidYMid meet'>
                <g transform='translate(0.000000,512.000000) scale(0.100000,-0.100000)' stroke='none'>
                    <path d='M2370 5113 c-379 -36 -661 -116 -980 -278 -378 -193 -717 -497 -965 -865 -104 -156 -232 -419 -294 -605 -49 -150 -89 -321 -113 -490 -17 -118 -17 -512 0 -630 42 -295 120 -553 242 -800 137 -280 272 -468 494 -691 221 -220 412 -357 681 -489 188 -92 309 -137 500 -185 500 -126 1002 -102 1490 71 150 53 408 183 540 271 302 202 573 480 769 788 72 113 188 353 235 486 235 662 194 1372 -115 1993 -124 250 -263 447 -458 648 -214 222 -430 379 -711 518 -296 146 -572 225 -900 255 -102 9 -333 11 -415 3z m545 -342 c628 -106 1158 -448 1511 -977 179 -267 296 -573 351 -909 24 -153 24 -497 0 -650 -108 -668 -474 -1222 -1042 -1580 -243 -153 -537 -261 -850 -312 -154 -24 -497 -24 -650 1 -657 107 -1198 456 -1557 1006 -168 257 -281 557 -335 885 -24 153 -24 497 0 650 81 497 291 912 636 1255 382 381 862 605 1401 654 108 10 418 -4 535 -23z' />
                    <path d='M1402 3492 c-94 -34 -178 -123 -203 -215 -19 -69 -7 -175 27 -236 59 -109 153 -165 279 -165 94 -1 157 23 218 82 132 127 139 314 16 447 -87 94 -220 128 -337 87z' />
                    <path d='M3530 3501 c-90 -30 -174 -103 -212 -186 -30 -68 -30 -180 0 -247 29 -66 102 -141 165 -169 78 -35 192 -34 269 4 71 35 130 101 159 176 27 73 23 185 -10 249 -57 110 -153 173 -274 178 -40 2 -83 0 -97 -5z' />
                    <path d='M1507 1786 c-72 -26 -107 -76 -107 -153 0 -57 26 -105 72 -133 32 -20 53 -20 1088 -20 1035 0 1056 0 1088 20 101 62 97 213 -8 274 -35 21 -46 21 -1065 23 -851 2 -1037 0 -1068 -11z' />
                </g>
            </svg>;
        } else if (sentiment === "Negative") {
            svg = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width={20} height={20}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
            </svg>
                ;
        }
        return svg;
    }
    return (
        <Fragment>
            <div id="page">
                {page === 'main' && <div className="page-content header-clear-small">
                    <div className="card card-mobile-style" style={{ borderRadius: '15px' }}>
                        <div className="content">
                            <p className=""><b>Thread Summary</b></p>
                            {threadLoading &&
                                <div id="thread-loader" className="preloader-show">
                                    <div className="spinner-border color-highlight-myma" role="status" style={{ height: '1.5rem', width: '1.5rem' }}>
                                    </div>
                                </div>}
                            {/* {threadResponse?.email_history && <Fragment>
                                <h6 className="my-1">Latest Email: {moment(threadResponse?.email_history?.LastMessage).format('YYYY-MM-DD hh:mm')}</h6>
                                <h6 className="my-1">First Email: {moment(threadResponse?.email_history?.FirstMessage).format('YYYY-MM-DD hh:mm')}</h6>
                            </Fragment>} */}
                            <p className="mb-2" style={{ cursor: 'pointer', color: `${reply === threadResponse?.summary ? '#ef4A81' : 'black'}` }}>
                                {threadResponse?.summary}
                            </p>
                        </div>
                    </div>
                    {threadResponse !== undefined && <div className="card card-mobile-style" style={{ borderRadius: '15px' }}>
                        <div className="content">
                            <div className="list-group list-custom list-group-m list-group-flush rounded-xs check-visited">
                                {threadResponse?.customer_sentiment &&
                                    <div className="list-group-item">
                                        {getExpression(threadResponse?.customer_sentiment)}
                                        <div className="ml-3">Sentiment: {threadResponse?.customer_sentiment}</div>
                                    </div>}
                                {threadResponse?.topics &&
                                    <div className="list-group-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width={20} height={20}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                        </svg>
                                        <div className="ml-3">Topic: {threadResponse?.topics}</div>
                                    </div>
                                }
                                {threadResponse?.topics &&
                                    <div className="list-group-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width={20} height={20}>
                                            <path strokeLinecap="round" strokeLinejoinn="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                        </svg>
                                        <div className="ml-3">Urgency: {threadResponse?.priority}</div>
                                    </div>
                                }
                                {threadResponse?.language !== locale &&
                                    <div className="list-group-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width={20} height={20}>
                                            <path strokeLinecap="round" strokeLinejoinn="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                        </svg>
                                        <div className="ml-3">Language: {threadResponse?.language}</div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>}


                    {threadResponse !== undefined &&
                        <Fragment>

                            <div className="col-12 text-center mb-2">
                                <button type="submit" onClick={handleReplyPage} className="btn-full btn button-myma-primary" style={{ width: '66%' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width={20} height={20}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                                    </svg>
                                    <span className="ml-1">Generate Reply</span>
                                </button>
                            </div>
                            <div className="col-12 text-center">
                                <button type="submit" onClick={handleTicket} className="btn-full btn button-myma-primary" style={{ width: '66%' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width={20} height={20}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
                                    </svg>
                                    <span className="ml-1">Convert to Ticket</span></button>
                            </div>
                        </Fragment>}

                </div>}
                {page === 'reply' && <Reply mailStatsChange={mailStatsChange} handleManage={handleManage} cid={cid} gid={gid} pid={pid} propertyDetails={propertyDetails} emailIntegration={emailIntegration} questionSetDetails={questionSetDetails}></Reply>}
                {page === 'help' && <Help gid={gid} pid={pid}></Help>}
                {page === 'search' && <Search cid={cid} reply={reply} responseList={responseList} handleManage={handleManage} gid={gid}></Search>}
                <Footer reply={reply} handleManage={handleManage}>
                </Footer>
            </div>
        </Fragment>);
}
export default Main;