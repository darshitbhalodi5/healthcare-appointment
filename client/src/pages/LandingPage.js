import React from "react";
import NewNavbar from "../components/NewNavbar";
import NewHeroPage from "../components/NewHeroPage";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <NewNavbar />
      <NewHeroPage />
    </div>
  );
};

export default LandingPage;
