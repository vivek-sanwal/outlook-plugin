import React, { Fragment, useEffect, useState } from "react";
import loader from "../assets/images/plugin_loader.gif";
import { gAPI_PROPERTY_DETAILS, gAPI_Email_Integrations, gAPI_QUESTION_SET_DETAILS } from "../constants/api";
import Main from "./main";
const PluginApp = ({ gid, pid, iid }) => {
    const [loading, setLoading] = useState(false);
    const [propertyDetails, setPropertyDetails] = useState();
    const [emailIntegration, setEmailIntegration] = useState();
    const [questionSetDetails, setQuestionSetDetails] = useState();
    const [isValid, setIsValid] = useState(false);
    const [authContext, setAuthContext] = useState();
    const [locale, setLocale] = useState('');
    useEffect(() => {
        setLoading(true);
        const callApi = async () => {
            const authContext = await Office.auth.getAuthContext();
            await fetch(`${gAPI_PROPERTY_DETAILS}/${pid}?group_id=${gid}`,
                {
                    method: "get",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }).then(res => res.json()).then((result) => {
                    setPropertyDetails(result);
                }).catch(err => {
                });
            await fetch(`${gAPI_Email_Integrations}/${iid}?group_id=${gid}`,
                {
                    method: "get",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }).then(res => res.json()).then(async (result) => {
                    if (result?.channelDetails && result?.channelDetails?.autonomousReplies) {
                        let flow = result?.channelDetails?.autonomousReplies;
                        let emailsData = result?.channelDetails?.addOn?.emails || [];
                        if (flow?.versionDynamicFlow === "6DynamicConverstionFlow") {
                            await fetch(`${gAPI_QUESTION_SET_DETAILS}?id=${flow?.assistantId}`,
                                {
                                    method: "get",
                                    headers: {
                                        Accept: "application/json",
                                        "Content-Type": "application/json",
                                    },
                                }).then(res => res.json()).then(async (res) => {
                                    setQuestionSetDetails(res.result);
                                });
                        }
                        setAuthContext(authContext);
                        if (emailsData.length > 0 && emailsData.filter(f => f.email === authContext.userPrincipalName).length > 0) {
                            setLocale(emailsData.filter(f => f.email === authContext.userPrincipalName)[0]?.language);
                            setIsValid(true);
                        }
                        setEmailIntegration(result);
                    }
                }).catch(err => {
                });
        }
        const handleApi = async () => {
            await callApi();
            setLoading(false);
        }
        handleApi();
    }, [pid]);
    return (
        <Fragment>
            {loading ?
                <div style={{
                    backgroundColor: '#f1f1f7',
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
                <Fragment>
                    {isValid &&
                        <Main locale={locale} gid={gid} iid={iid} pid={pid} authContext={authContext} propertyDetails={propertyDetails} emailIntegration={emailIntegration} questionSetDetails={questionSetDetails}>
                        </Main>
                    }
                </Fragment>}
        </Fragment>);
}
export default PluginApp;