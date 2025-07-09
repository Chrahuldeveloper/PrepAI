"use client";
import { useEffect, useState } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import Image from "next/image";
import { FiTrash } from "react-icons/fi";
import { RiTimerLine } from "react-icons/ri";
import { CiPlay1 } from "react-icons/ci";
import { motion, AnimatePresence } from "framer-motion";
import { MdDescription, MdQuestionAnswer, MdScore } from "react-icons/md";
import { FaRegSave } from "react-icons/fa";
import { IoPauseOutline } from "react-icons/io5";
import logo from "../../pages/logo.png";
export default function Index() {
  const [section, setsection] = useState("Job description");
  const [jobapplications, setjobapplications] = useState([]);
  const [isloading, setisloading] = useState(false);
  const [toogleText, settoogleText] = useState("Save");
  const [jobData, setjobData] = useState({
    jobTitle: "",
    jobDescription: "",
    questions: [],
    hostname: "",
    link: "",
  });

  const [openQuestionIndex, setopenQuestionIndex] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [analysis, setanalysis] = useState({
    questionsAttempted: 0,
    averageScore: 0,
    overallScore: 0,
    relevance: 0,
    technicalDepth: 0,
    clarityCommunication: 0,
  });

  const [answers, setanswers] = useState({});

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

  useEffect(() => {
    if (typeof window !== "undefined" && chrome?.storage) {
      chrome.storage.local.get("scrapedData", (data) => {
        if (data.scrapedData) {
          const { desc, title, hostname, questions, link } = data.scrapedData;
          setjobData((prev) => ({
            ...prev,
            jobTitle: title,
            jobDescription: desc,
            hostname: hostname,
            questions: questions || [],
            link: link,
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
        link: jobData.link,
      };

      chrome.storage.local.get(["jobApplications"], (res) => {
        const updatedJobs = [...(res.jobApplications || []), newJob];
        chrome.storage.local.set({ jobApplications: updatedJobs }, () => {
          console.log("Job saved successfully");
          setjobapplications(updatedJobs);
          settoogleText("Saved");
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

  const getAnalysis = async (data) => {
    try {
      console.log(data);
      const res = await fetch(
        "https://analysis-ai.chrahulofficial.workers.dev",
        {
          method: "POST",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ questions: data }),
        }
      );
      const aidata = await res.json();
      setanalysis((prev) => ({
        ...prev,
        averageScore: aidata.averageScore,
        overallScore: aidata.overallScore,
        questionsAttempted: aidata.questionsAttempted,
        relevance: aidata.relevance,
        technicalDepth: aidata.technicalDepth,
        clarityCommunication: aidata.clarityCommunication,
      }));
      setsection("Score");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className="header-top">
        <div className="top-bar">
          <div className="">
            <Image src={logo} style={{ width: "80px", height: "80px" }} />
          </div>
          <div>
            <h1 className="top-bar-heading">Interview Prep AI</h1>
            <p className="top-bar-para">AI Powered</p>
          </div>
        </div>
        <div>
          <button onClick={handleSaveJob} className="save-btn">
            {toogleText}
          </button>
        </div>
      </div>

      <ul className="list-items">
        {[
          {
            key: "Job description",
            label: "Job description",
            icon: MdDescription,
          },
          { key: "Questions", label: "Questions", icon: MdQuestionAnswer },
          { key: "Score", label: "Score", icon: MdScore },
          { key: "applications", label: "Saved Applications", icon: FaRegSave },
        ].map(({ key, label, icon: Icon }) => (
          <li
            key={key}
            className={section === key ? "item-highlight" : "item"}
            onClick={() => setsection(key)}
          >
            <Icon size={16} className="mr-1 inline-block align-text-top" />
            <div>{label}</div>
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "30px",
              }}
            >
              {jobapplications.map((job, id) => (
                <div className="q-box" key={id}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "15px",
                      border: "1px solid #024059",
                      padding: "15px",
                      borderRadius: "25px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                      }}
                    >
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
                        <h1
                          style={{
                            fontSize: "18px",
                            fontWeight: "500",
                            color: "white",
                          }}
                        >
                          {job.title}
                        </h1>
                        <p
                          onClick={() => {
                            chrome.tabs.create({ url: job.link });
                          }}
                          style={{
                            color: "#7e8490",
                            cursor: "pointer",
                          }}
                        >
                          {job.hostname}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleDelete(job);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                      }}
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

      {section === "Score" ? (
        <>
          {analysis.questionsAttempted > 0 ? (
            <>
              <div
                style={{
                  display: "flex",
                  padding: "40px 20px",
                  gap: "30px",
                }}
              >
                <div
                  style={{
                    width: "80vw",
                    margin: "0px auto",
                    border: "1px solid  #024059",
                    padding: "30px",
                    borderRadius: "30px",
                  }}
                >
                  <h1
                    style={{
                      color: "white",
                      fontSize: "24px",
                      marginBottom: "20px",
                    }}
                  >
                    AI Answer Analysis
                  </h1>

                  <h2
                    style={{
                      color: "#60a5fa",
                      fontSize: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: "10px",
                        height: "10px",
                        backgroundColor: "#60a5fa",
                        borderRadius: "50%",
                      }}
                    ></span>
                    Performance Metrics
                  </h2>
                  {[
                    {
                      label: "Average Score",
                      value: analysis.averageScore,
                    },
                    {
                      label: "Overall Score",
                      value: analysis.overallScore,
                    },
                    {
                      label: "Relevance",
                      value: analysis.relevance,
                    },
                    {
                      label: "Technical Depth",
                      value: analysis.technicalDepth,
                    },
                    {
                      label: "clarity & Communication",
                      value: analysis.clarityCommunication,
                    },
                  ].map((metric, idx) => {
                    const isPercent = !metric.isCount;
                    const display = isPercent
                      ? `${metric.value}%`
                      : metric.value;
                    const barWidth = isPercent ? `${metric.value}%` : "100%";

                    return (
                      <div key={idx} style={{ margin: "10px 0 30px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            color: "white",
                            fontSize: "14px",
                          }}
                        >
                          <span>{metric.label}</span>
                          <span>{display}</span>
                        </div>

                        <div
                          style={{
                            height: "8px",
                            background: "#1f2937",
                            borderRadius: "8px",
                            overflow: "hidden",
                            marginTop: "4px",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: barWidth,
                              backgroundColor: "#3b82f6",
                              transition: "width 0.3s ease-in-out",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <p
                  style={{
                    textAlign: "center",
                    paddingTop: "20px",
                  }}
                  className="noq"
                >
                  Please attempt some questions to see your performance insights
                  here
                </p>
              </div>
            </>
          )}
        </>
      ) : null}

      {section === "Questions" ? (
        <div className="questions">
          {jobData.questions.length > 0 ? (
            jobData.questions.slice(1).map((q, id) => (
              <>
                <div className="q-box" key={id}>
                  <div className="q-box-inner">
                    <div className="q-inner-box">
                      <h1 className="q-heading">
                        {q.replace(/^\[[^\]]+\]\s*/, "")}{" "}
                      </h1>
                      {(() => {
                        const tag = q.match(/^\[([^\]]+)\]/)?.[1] ?? "",
                          variant = tag.toLowerCase().startsWith("tech")
                            ? "tech"
                            : tag.startsWith("Beh")
                            ? "beh"
                            : tag.startsWith("Lead")
                            ? "lead"
                            : "";
                        return <p className={`q-tag ${variant}`}>{tag}</p>;
                      })()}{" "}
                    </div>
                    <div className="arrow-icon">
                      {id + 1 !== 0 &&
                        (id === openQuestionIndex ? (
                          <button
                            className="practice-btn"
                            onClick={() => setopenQuestionIndex(null)}
                          >
                            <IoPauseOutline size={20} color="black" />
                            <p>Close</p>
                          </button>
                        ) : (
                          <button
                            className="practice-btn"
                            onClick={() => setopenQuestionIndex(id)}
                          >
                            <CiPlay1 size={20} color="black" />
                            <p>Practice</p>
                          </button>
                        ))}
                    </div>
                  </div>

                  <AnimatePresence>
                    {id === openQuestionIndex && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{ overflow: "hidden", width: "100%" }}
                      >
                        <textarea
                          className="ans-box"
                          placeholder="Enter your answer here..."
                          rows={6}
                          value={answers[id] || ""}
                          onChange={(e) =>
                            setanswers((prev) => ({
                              ...prev,
                              [id]: e.target.value,
                            }))
                          }
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ))
          ) : (
            <p className="noq">No interview questions</p>
          )}

          {jobData.questions.length > 0 && (
            <button
              className="btn-export"
              disabled={isSubmitting}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  const qaPairs = jobData.questions.map((q, idx) => ({
                    question: q,
                    answer: answers[idx] || "",
                  }));
                  await getAnalysis(qaPairs);
                } catch (error) {
                  console.log(error);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              Submit
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
