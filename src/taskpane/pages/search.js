import React, { Fragment, useState } from "react";
import { gAPI_THREAD_SUMMARY } from "../../constants/api";
import CopyToClipboard from 'react-copy-to-clipboard';
const Search = ({ reply, gid,cid, handleManage, responseList }) => {
    const [search, setSearch] = useState('');
    const [loading,setLoading] = useState(false);
    const handleSearch = () => {
        let url = `${gAPI_THREAD_SUMMARY}`;
        setLoading(true);        
        fetch(url,
            {
                method: "Post",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "groupId": gid,
                    "propertyId": "e655dab2-987b-4683-ad9b-599814b414b6",
                    "language": "en", "q": "",
                    "suffix": "You are a Chatbot working as an employee at Hotel Grand. When responding, always refer to the hotel as \"we\" or \"our.\"",
                    "conversationId": cid,
                    "propertyName": "Hotel Grand (CPG)",
                    "modelName": "gpt-4o-mini",
                    "history": [{ "human": search }]
                }),
            }).then(res => res.json()).then(async (result) => {
                if (result.arguments !== undefined) {
                    let data = JSON.parse(result.arguments);
                    let lst = [...responseList];
                    lst.push(data?.response);                    
                    handleManage('responseList', lst);
                    setLoading(false);
                    setSearch('');
                }
            });
    }

    const handleChange = (e) => setSearch(e.target.value);

    return (
        <Fragment>
            <div className="page-content header-clear-small">
                <div className="row">
                    <div className="col-md-12 text-center">
                        <div className="form-field form-email">
                            <input type="text" onChange={handleChange} name="" placeholder="Search" value={search} className="round-small" id="contactEmailField" />
                        </div>
                    </div>
                </div>
                <div className="col-md-12 text-center my-2">
                    <div className="form-button">
                        <input type="button" onClick={() => handleSearch(search)} className="btn-full btn border-myma button-myma-primary" value="Submit" />
                    </div>
                </div>

                <div className="col-md-12 mt-2">
                    {loading ?
                        <div id="thread-loader" className="preloader-show">
                            <div className="spinner-border color-highlight-myma" role="status" style={{ height: '1.5rem', width: '1.5rem' }}>
                            </div>
                        </div> :
                        <Fragment>
                            {responseList.length > 0 && <Fragment>
                                {responseList.map(m => <div className="card card-mobile-style">
                                    <div className="content row mx-0">
                                        <div className="col-md-12 mb-2">
                                            <CopyToClipboard text={m}>
                                                <button type="submit"
                                                    style={{
                                                        float: 'right',
                                                        color: 'grey',
                                                        border: 'none',
                                                        background: 'transparent',
                                                        padding: '10px 21px 0px 0px',
                                                    }}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width={20} height={20}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                                                    </svg>
                                                </button>
                                            </CopyToClipboard>
                                        </div>
                                        <div className="col-md-12 mb-2">
                                            <p className="mb-2" style={{ cursor: 'pointer', color: `${reply === m ? '#ef4A81' : 'black'}` }}>
                                                {m}
                                            </p>
                                        </div>
                                    </div>
                                </div>)}
                            </Fragment>}
                        </Fragment>}
                </div>
            </div>

        </Fragment>
    );
}

export default Search;