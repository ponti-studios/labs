import styled from "@emotion/styled";

import Emoji from "ui/Emoji";

import svg from "./world.svg";
import { mediaQueries } from "src/constants/styles";

const Wrap = styled.div`
  display: flex;
  justify-items: center;
  align-items: center;
  margin-bottom: 4rem;
  width: 100%;

  ${mediaQueries.belowMedium} {
    flex-direction: column;
  }

  ${mediaQueries.belowMedium} {
    max-width: calc(100% - 16px);
    margin: 0 auto;
  }
`;

const HeroImage = styled.div`
  width: 50%;
  background-image: url(${svg});
  background-size: cover;
  background-position: center;

  ${mediaQueries.belowMedium} {
    width: 100%;
  }
`;

const HeroText = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 50%;
  height: 100%;
  padding: 0 2rem;

  ${mediaQueries.belowMedium} {
    width: 100%;
  }
`;

const Home = () => {
  return (
    <Wrap>
      <HeroImage className="h-52 md:h-full" />
      <HeroText className="flex justify-between items-center mt-16 mb-16 gap-14 max-md:flex-col w-44">
        <p className="flex items-center text-primary font-extrabold text-xl">
          <Emoji kind="map" size="lg" className="animate-spin-slow">
            🌎
          </Emoji>
          <span className="ml-2">the world if finally yours</span>
        </p>
        <p className="flex items-center text-primary font-extrabold text-xl">
          <Emoji kind="map" size="lg" className="animate-spin-slow">
            📍
          </Emoji>
          <span className="ml-2">Discover the places your friends love</span>
        </p>
        <p className="flex items-center text-primary font-extrabold text-xl">
          <Emoji kind="map" size="lg" className="animate-spin-slow">
            🤩
          </Emoji>
          <span className="ml-2">Never wonder where to go again</span>
        </p>
        <div className="mt-2">
          <button className="btn btn-primary font-extrabold lowercase">
            Get Started
          </button>
        </div>
      </HeroText>
    </Wrap>
  );
};

export default Home;
