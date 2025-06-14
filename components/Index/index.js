"use client";
import React, { useEffect, useState } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import { saveAs } from "file-saver";
import Image from "next/image";
import { FiTrash } from "react-icons/fi";


export default function Index() {

  const [section, setsection] = useState("Job description");

  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [hostname, sethostname] = useState("")
  const [jobapplications, setjobapplications] = useState([]);
  const [isloading, setisloading] = useState(false);
  const getInterviewQuestions = async (data, tittle) => {
    try {
      setisloading(true);
      let headersList = {
        Accept: "*/*",
        "Content-Type": "application/json",
      };

      const bodyContent = JSON.stringify({
        message: data,
        tittle: tittle,
      });

      const res = await fetch(
        "https://billowing-block-bbc2.chrahulofficial.workers.dev",
        {
          method: "POST",
          body: bodyContent,
          headers: headersList,
        }
      );
      setQuestions;
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const resdata = await res.json();
      console.log("API Response:", resdata);
      setsection("Questions");
      if (resdata.questions) {
        setQuestions(resdata.questions);
      } else {
        setQuestions([]);
      }
      setisloading(false);
    } catch (error) {
      console.error("Error fetching interview questions:", error);
    }
  };

  const exportFile = () => {
    const blobdata = new Blob([questions.join("\n\n")], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blobdata, "questions.txt");
  };


  useEffect(() => {
    if (typeof window !== "undefined" && chrome?.storage) {
      chrome.storage.local.get("scrapedData", (data) => {
        if (data.scrapedData) {
          setJobDescription(data.scrapedData.desc);
          setJobTitle(data.scrapedData.title)
          sethostname(data.scrapedData.hostname)
          getInterviewQuestions(data.scrapedData.desc, data.scrapedData.tittle);
        }
      });
    }
  }, []);


  useEffect(() => {
    if (typeof window !== "undefined" && chrome?.storage) {
      chrome.storage.local.get("jobApplications", (data) => {
        const storedJobs = data.jobApplications || [];
        setjobapplications(storedJobs);
      });
    }
  }, []);


  const handleSaveJob = () => {
    if (typeof window !== "undefined" && chrome?.storage) {
      const newJob = {
        title: jobTitle,
        hostname: hostname,
        timestamp: new Date().toISOString(),
      };

      chrome.storage.local.get(["jobApplications"], (res) => {
        const existingJobs = res.jobApplications || [];
        const updatedJobs = [...existingJobs, newJob];

        chrome.storage.local.set({ jobApplications: updatedJobs }, () => {
          console.log("Job saved successfully");
          setjobapplications(updatedJobs);
        });
      });
    } else {
      console.log("Storage not available");
    }
  };


  const handleDelete = (deletejob) => {
    chrome.storage.local.get(["jobApplications"], (data) => {
      const existingJobs = data.jobApplications || [];
      const updatedJobs = existingJobs.filter((job) => job.timeStamp !== deletejob.timeStamp)
      chrome.storage.local.set({ jobApplications: updatedJobs }, () => {
        console.log("Job deleted successfully");
        setjobapplications(updatedJobs);
      });
    })
  }


  return (
    <>
      <div>
        <div className="header-top">
          <div className="top-bar">
            <div className="logo-box">IP</div>
            <h1 className="top-bar-heading">InterviewPrep.ai</h1>
          </div>
          <div>
            <button onClick={handleSaveJob} className="save-btn">
              Save
            </button>
          </div>
        </div>

        <div>
          <ul className="list-items">
            <li
              className={`${section === "Job description" ? "item-highlight" : "item"
                }`}
              onClick={() => {
                setsection("Job description");
              }}
            >
              Job Description
            </li>
            <li
              className={`${section === "Questions" ? "item-highlight" : "item"
                }`}
              onClick={() => {
                setsection("Questions");
              }}
            >
              Questions
            </li>
            <li
              className={`${section === "applications" ? "item-highlight" : "item"
                }`}
              onClick={() => {
                setsection("applications");
              }}
            >
              Saved Applications
            </li>
          </ul>
        </div>

        {isloading && section !== "applications" && (
          <LuLoaderCircle className="animate-loader" size={30} color="gray" />
        )}

        {section === "Job description" && (
          <div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="popup-textarea"
              placeholder="Paste job description here..."
              disabled={!!jobDescription}
              rows={8}
            />
          </div>
        )}

        {section === "applications" && (
          <div className="applications">
            {jobapplications.length === 0 ? (
              <p className="noq" style={{ textAlign: "center" }}>
                No saved applications yet.
              </p>
            ) : (
              <div style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center"
              }}>
                {jobapplications.map((job, id) => (
                  <div className="q-box" key={id}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "15px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        {job.hostname === "internshala.com" ? (
                          <Image
                            src="https://internshala.com//static/images/internshala_og_image.jpg"
                            width={80}
                            height={40}
                            blurDataURL="https://internshala.com//static/images/internshala_og_image.jpg"
                            priority
                            placeholder="blur"
                            alt="Logo"
                          />
                        ) : (
                          <Image
                            src="https://images.ctfassets.net/e8i6c2002cqg/336jHkunz7PxBObVvPuQ5A/96aee60cdf3eee9f09381682daf56a44/auXY68iA.png"
                            width={80}
                            height={40}
                            blurDataURL="https://images.ctfassets.net/e8i6c2002cqg/336jHkunz7PxBObVvPuQ5A/96aee60cdf3eee9f09381682daf56a44/auXY68iA.png"
                            priority
                            placeholder="blur"
                            alt="Logo"
                          />
                        )}
                        <div>
                          <h1 style={{ fontSize: "18px", fontWeight: "500" }}>{job.title}</h1>
                          <p>{job.hostname}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          handleDelete(job)
                        }}
                        style={{ background: "transparent", border: "none", cursor: "pointer" }}
                      >
                        <FiTrash size={20} color="#ff4d4f" />
                      </button>
                    </div>
                  </div>
                ))}

              </div>
            )}
          </div>
        )}

        {section === "Questions" && (
          <div className="questions">
            {questions.length > 0 ? (
              questions.map((i, id) => (
                <React.Fragment key={id}>
                  <div className="q-box">
                    <h1 className="q-heading">{i}</h1>
                  </div>
                </React.Fragment>
              ))
            ) : (
              <p className="noq">No interview questions</p>
            )}
            {questions.length > 0 && (
              <button onClick={exportFile} className="btn-export">
                Export File
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}