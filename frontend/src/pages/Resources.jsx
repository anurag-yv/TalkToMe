import React from 'react';

const toolsData = [
  {
    category: "Real-Time Voice & Video Communication",
    description: "Tools for group video/voice calls, meetings, webinars.",
    items: [
      {
        name: "Zoom",
        description: "Widely used for online meetings and webinars with interactive features.",
        url: "https://zoom.us/"
      },
      {
        name: "Google Meet",
        description: "Browser-based video and voice calling integrated with Google Workspace.",
        url: "https://meet.google.com/"
      },
      {
        name: "Microsoft Teams",
        description: "Robust platform for chat, meetings, and collaboration.",
        url: "https://www.microsoft.com/en-us/microsoft-teams/group-chat-software"
      },
      {
        name: "Jitsi Meet",
        description: "Free, open-source video conferencing tool needing no account.",
        url: "https://meet.jit.si/"
      },
    ]
  },
  {
    category: "Chat, Instant Messaging & Always-On Audio",
    description: "Real-time messaging and voice chat platforms for communities and teams.",
    items: [
      {
        name: "Slack",
        description: "Popular chat and workspace collaboration with channels and huddles.",
        url: "https://slack.com/"
      },
      {
        name: "Discord",
        description: "Community-focused voice, video, and text chat platform.",
        url: "https://discord.com/"
      },
      {
        name: "Telegram",
        description: "Secure messaging app with group chat and voice call support.",
        url: "https://telegram.org/"
      },
      {
        name: "WhatsApp",
        description: "Widely used encrypted messaging and calling platform.",
        url: "https://www.whatsapp.com/"
      }
    ]
  },
  {
    category: "Facilitation & Interactive Conversation Tools",
    description: "Creative collaboration and engagement tools enhancing conversations with activities.",
    items: [
      {
        name: "Miro",
        description: "Online whiteboard perfect for brainstorming and visual collaboration.",
        url: "https://miro.com/"
      },
      {
        name: "Padlet",
        description: "Virtual boards for pinning ideas, chatting, and collaboration.",
        url: "https://padlet.com/"
      },
      {
        name: "Kumospace",
        description: "Virtual spaces for free-moving audio & video conversations with fun layouts.",
        url: "https://kumospace.com/"
      },
      {
        name: "Kahoot!",
        description: "Gamified quizzes and polls to energize group conversations.",
        url: "https://kahoot.com/"
      }
    ]
  },
  {
    category: "Conversation Intelligence & Professional Tools",
    description: "AI-driven platforms to analyze, coach, and improve communication.",
    items: [
      {
        name: "Gong",
        description: "Record and analyze sales and team calls for insights.",
        url: "https://www.gong.io/"
      },
      {
        name: "Chorus",
        description: "Conversation intelligence platform for transcription and coaching.",
        url: "https://www.chorus.ai/"
      },
      {
        name: "Poised",
        description: "AI coach providing live feedback on your communication during calls.",
        url: "https://www.poised.com/"
      }
    ]
  }
];

const ToolsPage = () => {
  return (
    <>
      <style>{`
        /* Global box-sizing */
        *, *::before, *::after {
          box-sizing: border-box;
        }
        body, html, #root {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          width: 100%;
          min-height: 100vh;
          background: #f0f4ff;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .tools-container {
          padding: 40px 5vw;
          max-width: 1200px;
          margin: 0 auto;
          color: #1f2937;
          width: 100%;
        }

        h1 {
          text-align: center;
          margin-bottom: 24px;
          font-weight: 800;
          font-size: 2.5rem;
          color: #2563eb;
          line-height: 1.1;
        }

        p.description {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 40px auto;
          font-size: 1.1rem;
          line-height: 1.6;
          color: #475569;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        section {
          margin-bottom: 48px;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        h2 {
          font-weight: 700;
          font-size: 1.8rem;
          color: #1e40af;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 6px;
          margin-bottom: 12px;
          word-break: break-word;
        }

        p.category-desc {
          font-size: 1rem;
          color: #4b5563;
          margin-bottom: 20px;
          word-break: break-word;
        }

        ul.tools-list {
          list-style: none;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin: 0;
        }

        li.tool-card {
          background: #f3f4f6;
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 2px 12px rgba(59,130,246,0.1);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 180px;
          word-break: break-word;
        }

        li.tool-card h3 {
          margin: 0 0 8px 0;
          font-size: 1.25rem;
          color: #2563eb;
          word-break: break-word;
        }

        li.tool-card p {
          margin: 0;
          color: #374151;
          font-size: 0.95rem;
          word-break: break-word;
        }

        a.visit-link {
          margin-top: 12px;
          align-self: flex-start;
          color: #3b82f6;
          font-weight: 600;
          text-decoration: underline;
          font-size: 1rem;
          word-break: break-word;
        }

        /* Responsive Adjustments */
        @media (max-width: 640px) {
          h1 {
            font-size: 2.1rem;
          }
          h2 {
            font-size: 1.5rem;
          }
          p.description {
            font-size: 1rem;
            max-width: 100%;
            padding: 0 10px;
          }
          .tools-container {
            padding: 20px 4vw;
          }
          ul.tools-list {
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
          }
          li.tool-card {
            height: auto;
          }
          a.visit-link {
            font-size: 0.95rem;
          }
        }
      `}</style>

      <div className="tools-container" role="main">
        <h1>Communication Tools & Platforms</h1>
        <p className="description">
          Collection of essential tools to facilitate talking, meetings, chats, and productive conversations for diverse settings.
        </p>

        {toolsData.map(({ category, description, items }) => (
          <section key={category} aria-label={category}>
            <h2>{category}</h2>
            <p className="category-desc">{description}</p>
            <ul className="tools-list">
              {items.map(({ name, description, url }) => (
                <li key={name} className="tool-card">
                  <div>
                    <h3>{name}</h3>
                    <p>{description}</p>
                  </div>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="visit-link"
                  >
                    Visit Website →
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
};

export default ToolsPage;
