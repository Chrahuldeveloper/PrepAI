"use client";
import { useEffect, useState } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import Image from "next/image";
import { FiTrash } from "react-icons/fi";
import { RiArrowDropDownLine } from "react-icons/ri";
import { RiArrowDropUpLine } from "react-icons/ri";
import { GoGoal } from "react-icons/go";
import { MdOutlinePercent } from "react-icons/md";
import { CiTrophy } from "react-icons/ci";
import { RiResetLeftFill } from "react-icons/ri";

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

  const [analysis, setanalysis] = useState({
    averageScore: 0,
    questionsAttempted: 0,
    overallScore: 0,
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
          <div className="logo-box">Crakup</div>
        </div>
        <div>
          <button onClick={handleSaveJob} className="save-btn">
            {toogleText}
          </button>
        </div>
      </div>

      <ul className="list-items">
        {["Job description", "Questions", "Score", "applications"].map(
          (item) => (
            <li
              key={item}
              className={section === item ? "item-highlight" : "item"}
              onClick={() => setsection(item)}
            >
              {item === "applications" ? "Saved Applications" : item}
            </li>
          )
        )}
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
                        <h1 style={{ fontSize: "18px", fontWeight: "500" }}>
                          {job.title}
                        </h1>
                        <p
                          onClick={() => {
                            chrome.tabs.create({ url: job.link });
                          }}
                          className="cursor-pointer"
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
                  gap: "15px",
                  justifyContent: "center",
                  alignContent: "center",
                  marginTop: "40px",
                }}
              >
                <div className="box">
                  <CiTrophy
                    size={25}
                    color="white"
                    style={{
                      backgroundColor: "#eab308",
                      borderRadius: "50px",
                      padding: "5px",
                    }}
                  />
                  <h1
                    style={{
                      fontWeight: "300",
                      fontSize: "20px",
                    }}
                  >
                    {analysis.averageScore}
                  </h1>
                  <p>Average Score</p>
                </div>
                <div className="box">
                  <GoGoal
                    size={25}
                    color="white"
                    style={{
                      backgroundColor: "#3b82f6",
                      borderRadius: "50px",
                      padding: "5px",
                    }}
                  />
                  <h1
                    style={{
                      fontWeight: "300",
                      fontSize: "20px",
                    }}
                  >
                    {analysis.questionsAttempted}
                  </h1>
                  <p>Questions Attempted</p>
                </div>
                <div className="box">
                  <MdOutlinePercent
                    size={25}
                    color="white"
                    style={{
                      backgroundColor: "#22c55e",
                      borderRadius: "50px",
                      padding: "5px",
                    }}
                  />
                  <h1
                    style={{
                      fontWeight: "300",
                      fontSize: "20px",
                    }}
                  >
                    {analysis.overallScore}%
                  </h1>
                  <p>Overall Score</p>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#ededed",
                  border: "1px solid lightgray",
                  borderRadius: "5px",
                  padding: "10px",
                  height: "30vh",
                  paddingTop: "-20px",
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "8px",
                }}
              >
                <div
                  style={{
                    width: "80vw",
                  }}
                >
                  <h1
                    style={{
                      fontSize: "20px",
                      fontWeight: "500",
                      padding: "5px",
                    }}
                  >
                    Overall Performance
                  </h1>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingTop: "-15px",
                      width: "70vw",
                    }}
                  >
                    <p
                      style={{
                        fontWeight: "500",
                        fontSize: "18px",
                        paddingLeft: "10px",
                      }}
                    >
                      Progress
                    </p>
                    <p
                      style={{
                        fontWeight: "700",
                      }}
                    >
                      100
                    </p>
                  </div>
                  <div style={{ width: "66vw", margin: "0px auto" }}>
                    <div
                      style={{
                        height: "10px",
                        backgroundColor: "#f1f5f9",
                        borderRadius: "9999px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${analysis.overallScore}%`,
                          backgroundColor: "#0f172a",
                          transition: "width 0.3s ease-in-out",
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p
                      style={{
                        textAlign: "center",
                        paddingTop: "2px",
                        color: "gray",
                        fontWeight: "700",
                      }}
                    >
                      {analysis.overallScore === 0
                        ? ""
                        : analysis.overallScore >= 90
                        ? "🏆 Outstanding! You're crushing it. Your prep is on point — just maintain this consistency and you're interview-ready."
                        : analysis.overallScore >= 75
                        ? "🔥 Great job! You're doing really well. A little more practice and you’ll be in the top tier. Keep pushing!"
                        : analysis.overallScore >= 60
                        ? "💪 Good effort. You’ve got a strong foundation — refine your answers and you’ll see a big improvement."
                        : analysis.overallScore >= 40
                        ? "🔄 You're getting there. Some answers are solid, but there’s room to improve. Focus on clarity and accuracy."
                        : analysis.overallScore >= 20
                        ? "🧱 Not bad. You're starting to get the hang of it. Review the questions again and try to fill in the gaps."
                        : "🌱 Everyone starts somewhere. Don’t be discouraged — use this as a baseline and build up from here. You’ve got this 💫"}
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignContent: "center",
                }}
              >
                <button
                  className="btn-export"
                  style={{
                    display: "flex",
                    alignContent: "center",
                    gap: "6px",
                    marginTop: "10px",
                  }}
                  onClick={() => {
                    setanalysis((prev) => ({
                      ...prev,
                      averageScore: "",
                      overallScore: "",
                      questionsAttempted: "",
                    }));
                    setsection("Questions");
                  }}
                >
                  <RiResetLeftFill size={18} color="white" /> Reset
                </button>
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
            jobData.questions.map((q, id) => (
              <>
                <div className="q-box" key={id}>
                  <div className="q-box-inner">
                    <h1 className="q-heading">{q}</h1>
                    <div>
                      {id !== 0 &&
                        (id === openQuestionIndex ? (
                          <RiArrowDropUpLine
                            size={25}
                            color="black"
                            cursor="pointer"
                            onClick={() => setopenQuestionIndex(null)}
                          />
                        ) : (
                          <RiArrowDropDownLine
                            size={25}
                            color="black"
                            cursor="pointer"
                            onClick={() => setopenQuestionIndex(id)}
                          />
                        ))}
                    </div>
                  </div>
                  {id === openQuestionIndex ? (
                    <div>
                      <textarea
                        cols={8}
                        rows={8}
                        value={answers[id] || ""}
                        onChange={(e) => {
                          setanswers((prev) => ({
                            ...prev,
                            [id]: e.target.value,
                          }));
                        }}
                        className="ans-box"
                        placeholder="Enter your Answer"
                      />
                    </div>
                  ) : null}
                </div>
              </>
            ))
          ) : (
            <p className="noq">No interview questions</p>
          )}

          {jobData.questions.length > 0 && (
            <button
              className="btn-export"
              onClick={async () => {
                try {
                  const qaPairs = jobData.questions.map((q, idx) => ({
                    question: q,
                    answer: answers[idx] || "",
                  }));
                  await getAnalysis(qaPairs);
                } catch (error) {
                  console.log(error);
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
