"use client";
import { useEffect, useState } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import { saveAs } from "file-saver";
import Image from "next/image";
import { FiTrash } from "react-icons/fi";

export default function Index() {
  const [section, setsection] = useState("Job description");
  const [jobapplications, setjobapplications] = useState([]);
  const [isloading, setisloading] = useState(false);

  const [jobData, setjobData] = useState({
    jobTitle: "",
    jobDescription: "",
    questions: [],
    hostname: "",
  });

  const getInterviewQuestions = async (data, title) => {
    try {
      setisloading(true);

      const res = await fetch(
        "https://billowing-block-bbc2.chrahulofficial.workers.dev",
        {
          method: "POST",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: data, tittle: title }),
        }
      );

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const resdata = await res.json();
      const questions = resdata.questions || [];

      setsection("Questions");
      setjobData((prev) => ({
        ...prev,
        questions,
      }));

      chrome.storage.local.get("scrapedData", (data) => {
        if (data.scrapedData) {
          const updatedData = {
            ...data.scrapedData,
            questions,
          };
          chrome.storage.local.set({ scrapedData: updatedData }, () => {
            console.log("Questions added to scrapedData");
          });
        }
      });
    } catch (error) {
      console.error("Error fetching interview questions:", error);
    } finally {
      setisloading(false);
    }
  };

  const exportFile = () => {
    const blobdata = new Blob([jobData.questions.join("\n\n")], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blobdata, "questions.txt");
  };

  useEffect(() => {
    if (typeof window !== "undefined" && chrome?.storage) {
      chrome.storage.local.get("scrapedData", (data) => {
        if (data.scrapedData) {
          const { desc, title, hostname, questions } = data.scrapedData;
          setjobData((prev) => ({
            ...prev,
            jobTitle: title,
            jobDescription: desc,
            hostname: hostname,
            questions: questions || [],
          }));

          if (!questions || questions.length === 0) {
            getInterviewQuestions(desc, title);
          } else {
            setsection("Questions");
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && chrome?.storage) {
      chrome.storage.local.get("jobApplications", (data) => {
        setjobapplications(data.jobApplications || []);
      });
    }
  }, []);

  const handleSaveJob = () => {
    if (typeof window !== "undefined" && chrome?.storage) {
      const newJob = {
        title: jobData.jobTitle,
        hostname: jobData.hostname,
        timestamp: new Date().toISOString(),
      };

      chrome.storage.local.get(["jobApplications"], (res) => {
        const updatedJobs = [...(res.jobApplications || []), newJob];
        chrome.storage.local.set({ jobApplications: updatedJobs }, () => {
          console.log("Job saved successfully");
          setjobapplications(updatedJobs);
        });
      });
    }
  };

  const handleDelete = (deletejob) => {
    chrome.storage.local.get(["jobApplications"], (data) => {
      const updatedJobs = (data.jobApplications || []).filter(
        (job) => job.timestamp !== deletejob.timestamp
      );
      chrome.storage.local.set({ jobApplications: updatedJobs }, () => {
        console.log("Job deleted successfully");
        setjobapplications(updatedJobs);
      });
    });
  };

  return (
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

      <ul className="list-items">
        {["Job description", "Questions", "applications"].map((item) => (
          <li
            key={item}
            className={section === item ? "item-highlight" : "item"}
            onClick={() => setsection(item)}
          >
            {item === "applications" ? "Saved Applications" : item}
          </li>
        ))}
      </ul>

      {isloading && section !== "applications" && (
        <LuLoaderCircle className="animate-loader" size={30} color="gray" />
      )}

      {section === "Job description" && (
        <textarea
          value={jobData.jobDescription}
          onChange={(e) =>
            setjobData((prev) => ({
              ...prev,
              jobDescription: e.target.value,
            }))
          }
          className="popup-textarea"
          placeholder="Paste job description here..."
          disabled={!!jobData.jobDescription}
          rows={8}
        />
      )}

      {section === "applications" && (
        <div className="applications">
          {jobapplications.length === 0 ? (
            <p className="noq" style={{ textAlign: "center" }}>
              No saved applications yet.
            </p>
          ) : (
            <div className="centered-column">
              {jobapplications.map((job, id) => (
                <div className="q-box" key={id}>
                  <div className="application-item">
                    <div className="application-details">
                      <Image
                        src={
                          job.hostname === "internshala.com"
                            ? "https://internshala.com//static/images/internshala_og_image.jpg"
                            : "https://images.ctfassets.net/e8i6c2002cqg/336jHkunz7PxBObVvPuQ5A/96aee60cdf3eee9f09381682daf56a44/auXY68iA.png"
                        }
                        width={80}
                        height={40}
                        alt="Logo"
                        blurDataURL="data:image/png;base64,abc"
                        placeholder="blur"
                        priority
                      />
                      <div>
                        <h1 style={{ fontSize: "18px", fontWeight: "500" }}>
                          {job.title}
                        </h1>
                        <p>{job.hostname}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(job)}
                      className="delete-btn"
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
          {jobData.questions.length > 0 ? (
            jobData.questions.map((q, id) => (
              <div className="q-box" key={id}>
                <h1 className="q-heading">{q}</h1>
              </div>
            ))
          ) : (
            <p className="noq">No interview questions</p>
          )}

          {jobData.questions.length > 0 && (
            <button onClick={exportFile} className="btn-export">
              Export File
            </button>
          )}
        </div>
      )}
    </div>
  );
}
