import React, { useState, useEffect, Fragment } from "react";
import ReactQuill from 'react-quill';
import './../../assets/quill.css';
import { gAPI_THREAD_SUMMARY, gAPI_THREAD_DYNAMIC_SUMMARY } from "../../constants/api";
import loader from "../../assets/images/plugin_loader.gif";
import CopyToClipboard from 'react-copy-to-clipboard';
const quillModules = {
    toolbar: [
        [{ header: '1' }, { header: '2' }, { font: [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [
            { list: 'ordered' },
            { list: 'bullet' },
            { indent: '-1' },
            { indent: '+1' },
        ],
        ['link'],
        ['clean'],
    ],
};
const quillFormats = [
    'header',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
];
const Reply = ({ pid, gid, cid, handleManage, mailStatsChange, emailIntegration, questionSetDetails }) => {
    const [reply, setReply] = useState('');
    const handleSummary = (text, systemInstructions, tools, url) => {
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
                    "propertyName": "Hotel Grand",
                    "modelName": "gpt-4o-mini",
                    "history": [{ "human": text }],
                    "systemInstructions": "Draft a polite and clear email response to a customer based on the provided email communication between the customer and a hotel. Greet the customer appropriately and use the available data to address their inquiries. If more information is required to answer their questions, request the necessary details in the email response.\n\n# Steps\n\n1. **Greet the Customer**: Begin the email with a courteous greeting using the customer's name if provided.\n2. **Understand and Address Inquiries**: Identify the key questions or requests in the customer's email and address them with the information available. Use polite language and maintain clarity.\n3. **Request Additional Information**: If certain questions cannot be fully answered with the available information, politely request the needed details from the customer to complete their query.\n4. **Close the Email**: End with a courteous closing, offering further assistance if needed.\n\n# Output Format\n\nThe response should be formatted as a paragraph structured email. It should contain:\n- A greeting\n- A body responding to the customer's inquiries\n- A request for additional information if necessary\n- A polite closing ensuring satisfaction or inviting further questions\n\n# Examples\n\n**Example Start**\n**Customer Email:** \"Dear Hotel, I would like to know if you have pet-friendly rooms available next weekend and the rates for a suite. Also, do you offer airport transfers? Thank you, Alex.\"\n\n**Drafted Response:**\n\"Dear Alex,\n\nThank you for reaching out to us regarding your upcoming stay. We are pleased to inform you that we do offer pet-friendly rooms. Regarding the rates for our suites next weekend, they start from [insert rate here]. Additionally, we provide airport transfer services; please let us know your flight details for us to arrange this service for you. If you have any more questions or need further assistance, feel free to ask.\n\nWarm regards,\nHotel Paradise\"\n**Example End**",
                    "tools": [],
                })
            }).then(res => res.json()).then(async (result) => {
                if (result.arguments !== undefined) {
                    let data = JSON.parse(result.arguments);
                    let obj = '';
                    if (data?.response && data?.response.split('\n')) {
                        console.log(data?.response.split('\n'));
                        data?.response.split('\n').map((m) => {
                            obj += '<p>' + m + '</p>';
                        })
                        setReply(obj);
                    } else {
                        setReply('<p>' + data?.response + '</p>');
                    }
                }
            }).catch(err => {
            });
    }
    useEffect(() => {
        if (reply === '') {
            Office.context.mailbox.item.body.getAsync(Office.CoercionType.Text, function (bodyTtext) {
                if (questionSetDetails !== undefined) {
                    let tools = [];
                    if (questionSetDetails?.flowInvokeApi && questionSetDetails.flowInvokeApi?.isEnabled == true)
                        tools = questionSetDetails.flowInvokeApi?.json;
                    handleSummary(bodyTtext['value'], questionSetDetails?.instructions, tools, gAPI_THREAD_DYNAMIC_SUMMARY);
                } else if (emailIntegration !== undefined) {
                    let flow = result?.channelDetails && result?.channelDetails?.autonomousReplies;
                    handleSummary(bodyTtext['value'], flow?.instructions, [], gAPI_THREAD_SUMMARY);
                }
            });
        }
    }, [pid]);

    const handleReply = async () => {
        await Office.context.mailbox.item.displayReplyAllFormAsync(reply);
        handleManage('updateStats', {
            pasteToOutlook: true,
            replyGenerated:mailStatsChange?.replyGenerated,  
            copyDraft: mailStatsChange?.copyDraft
        });
    }

    const handleChange=(source, content)=>{
        if(source === 'user')
            setReply(content);
    }


    const handleCopy = () => handleManage('updateStats', {
        pasteToOutlook: mailStatsChange?.pasteToOutlook,
        replyGenerated:mailStatsChange?.replyGenerated, 
        copyDraft: true
    });

    return (
        <Fragment>
            {reply === '' ?
                <div style={{
                    width: "100%",
                    position: "absolute",
                    bottom: "0",
                    zIndex: "1000",
                    opacity: "1",
                    height: "100%",
                    top: "0rem"
                }}>
                    <div style={{ position: "relative", top: "10rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div className="img-loader" role="status">
                            <img src={"https://mymaplugin.blob.core.windows.net/$web/plugin_loader.gif"} style={{ width: "80px", height: "80px" }} alt="loader" />
                        </div>
                    </div>
                </div> :
                <div className="page-content header-clear-small">
                    <div className="card card-mobile-style" style={{ borderRadius: '15px', height: `${window.innerHeight - 100}px` }}>
                        <div className="col-12">
                            <ReactQuill
                                theme="snow"
                                value={reply}
                                onChange={(content, delta, source) =>
                                 handleChange(source, content)
                                }
                                style={{ height: `${window.innerHeight - 150}px` }}
                                modules={quillModules}
                                formats={quillFormats}
                                name="ticketNotes"
                            />
                        </div>
                        <div className="col-12">
                            <div className="row" style={{ margin: '5px 0px' }}>
                                <div className="col-6 text-center">
                                    <CopyToClipboard text={reply} onCopy={handleCopy}>
                                        <button type="submit" className="btn-full btn border-green-dark reply-button" style={{ padding: '8px' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width={15} height={15}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                                            </svg>
                                            <span className="ml-1"> Copy Draft</span>
                                        </button>
                                    </CopyToClipboard>
                                </div>
                                <div className="col-6 text-center">
                                    <button type="submit" onClick={handleReply} className="btn-full btn border-green-dark reply-button" style={{ padding: '8px' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width={15} height={15}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                                        </svg>
                                        <span className="ml-1">Paste To Oulook</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}
        </Fragment>
    )
}

export default Reply;