"use client";
import React, { useEffect, useState } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import { saveAs } from "file-saver";
import { AiTwotoneThunderbolt } from "react-icons/ai";
import Image from "next/image";

export default function Index() {

  const [section, setsection] = useState("Job description");

  const [imageURL, setimageURL] = useState();
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [questions, setQuestions] = useState([]);
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

  console.log(questions);

  useEffect(() => {
    if (typeof window !== "undefined" && chrome?.storage) {
      chrome.storage.local.get("scrapedData", (data) => {
        if (data.scrapedData) {
          setJobDescription(data.scrapedData.desc);
          setJobTitle(data.scrapedData.title)
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


  useEffect(() => {
    let storedURL = localStorage.getItem("url");
    if (!storedURL) {
      storedURL =
        "https://firebasestorage.googleapis.com/v0/b/app-2-d919d.appspot.com/o/10567507-removebg-preview.png?alt=media&token=acf9efc4-3a27-4d50-ace1-2664486863ef";
      localStorage.setItem("url", storedURL);
    }
    setimageURL(storedURL);
  }, []);

  const handleSaveJob = () => {
    if (typeof window !== "undefined" && chrome?.storage) {
      const newJob = {
        title: jobTitle,
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

  console.log(jobapplications)

  return (
    <>
      <div>
        <div className="header-top">
          <div className="top-bar">
            <AiTwotoneThunderbolt size={25} />
            <h1 className="top-bar-heading">InterviewPrep</h1>
          </div>

          <div>
            <button onClick={handleSaveJob} className="save-btn">
              Save
            </button>
          </div>

        </div>
        <div className="banner">
          <div>
            <Image
              src={
                imageURL ||
                "https://firebasestorage.googleapis.com/v0/b/app-2-d919d.appspot.com/o/10567507-removebg-preview.png?alt=media&token=acf9efc4-3a27-4d50-ace1-2664486863ef"
              }
              width={250}
              height={250}
              blurDataURL="https://firebasestorage.googleapis.com/v0/b/app-2-d919d.appspot.com/o/10567507-removebg-preview.png?alt=media&token=acf9efc4-3a27-4d50-ace1-2664486863ef"
              priority
              placeholder="blur"
              alt="Picture of the author"
            />
          </div>
          <div>
            <h1 className="banner-heading">Interview Questions</h1>
            <p className="banner-para">
              Get AI-generated interview questions tailored to your role{" "}
            </p>
          </div>
        </div>

        <div className="">
          <ul className="list-items">
            <li
              className={`${section === "Job description" ? "item-highlight" : "item"
                }`}
              onClick={() => {
                setsection("Job description");
              }}
            >
              Job Descption
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
        {isloading && section === "Questions" || "Job description" ? (
          <LuLoaderCircle className="animate-loader" size={30} color="gray" />
        ) : null}
        {section === "Job description" ? (
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
        ) : section === "applications" ? (
          <div className="applications">
            {jobapplications.length === 0 ? (
              <p>No saved applications yet.</p>
            ) : (
              jobapplications.map((job, id) => (
                <div className="jd" key={id}>
                  <div>
                    <Image
                      src="https://internshala.com//static/images/internshala_og_image.jpg"
                      width={100}
                      height={50}
                      blurDataURL="https://internshala.com//static/images/internshala_og_image.jpg"
                      priority
                      placeholder="blur"
                      alt="Logo"
                    />
                  </div>
                  <div className="jd-content">
                    <h1>{job.title}</h1>
                  </div>
                </div>
              ))
            )}

          </div>
        ) : (
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
  );
}
