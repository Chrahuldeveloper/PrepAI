"use client";
import React, { useEffect, useState } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import { saveAs } from "file-saver";
import { AiTwotoneThunderbolt } from "react-icons/ai";
import Image from "next/image";

export default function Index() {

  const jobs = [
    {
      title: "Resize profile picture",
      desc: "Resize and compress a user’s profile picture to 200x200px.",
      hostname: "fiverr.com"
    },
    {
      title: "Fix broken anchor tag",
      desc: "Correct an HTML link that isn’t working on a landing page.Correct an HTML link that isn’t working on a landing pageCorrect an HTML link that isn’t working on a landing page",
      hostname: "upwork.com"
    },
    {
      title: "Transcribe 2-minute audio",
      desc: "Convert a short voice message into text format.",
      hostname: "rev.com"
    },
    {
      title: "Remove background from image",
      desc: "Edit an image to remove its background and export as PNG.",
      hostname: "canva.com"
    },
    {
      title: "Summarize blog post",
      desc: "Read a 500-word blog and write a 1-sentence summary.",
      hostname: "copy.ai"
    },
    {
      title: "Convert CSV to JSON",
      desc: "Write a script to convert CSV data to a JSON array.",
      hostname: "github.com"
    },
    {
      title: "Test form submission",
      desc: "Submit a contact form and verify the thank-you message appears.",
      hostname: "test.io"
    },
    {
      title: "Find broken links",
      desc: "Run a scan to identify dead links on a homepage.",
      hostname: "ahrefs.com"
    },
    {
      title: "Design favicon",
      desc: "Create a 16x16 and 32x32 favicon for a website.",
      hostname: "favicon.io"
    },
    {
      title: "Extract text from screenshot",
      desc: "Use OCR to extract text from an uploaded image.",
      hostname: "onlineocr.net"
    }
  ];



  const [section, setsection] = useState("Job description");

  const [imageURL, setimageURL] = useState();

  const [jobDescription, setJobDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [jobapplications, setjobapplications] = useState(jobs);
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
          getInterviewQuestions(data.scrapedData.desc, data.scrapedData.tittle);
        }
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
    if (typeof window != "undefined" && chrome?.storage) {
      chrome.storage.local.get(["jobApplications"], (res) => {
        console.log("Saved job applications:", res.jobApplications || []);
      })
    } else {
      console.log("stroage not avaliable")
    }
  }

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
        {isloading ? (
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
            {
              jobapplications.map((_, id) => {
                return (
                  <div className="jd">
                    <div>
                      <Image
                        src={
                          "https://internshala.com//static/images/internshala_og_image.jpg"
                        }
                        width={100}
                        height={50}
                        blurDataURL="https://internshala.com//static/images/internshala_og_image.jpg"
                        priority
                        placeholder="blur"
                        alt="Picture of the author"
                      />
                    </div>
                    <div className="jd-content">
                      <h1>{_.title}</h1>
                      <p>{_.desc}</p>
                    </div>
                  </div>
                )
              })
            }
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
