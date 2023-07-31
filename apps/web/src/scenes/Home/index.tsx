import styled from "@emotion/styled";

import { APP_NAME } from "src/constants";
import Emoji from "ui/Emoji";

import svg from "./world.svg";
import { mediaQueries } from "src/constants/styles";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  justify-items: center;
  align-items: center;
  width: 100%;

  ${mediaQueries.belowMedium} {
    max-width: calc(100% - 16px);
    margin: 0 auto;
  }
`;

const Hero = styled.div`
  display: flex;
  justify-items: center;
  align-items: center;
  width: 100%;
  height: 80vh;
  margin-bottom: 4rem;

  ${mediaQueries.belowMedium} {
    flex-direction: column;
  }
`;

const HeroImage = styled.div`
  width: 50%;
  height: 100%;
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
      <Hero>
        <HeroImage />
        <HeroText>
          <h1 className="text-base-content text-[6rem] font-extrabold">
            {APP_NAME}
          </h1>

          <p className="text-neutral-content font-extrabold text-xl">
            go more places
          </p>

          <div className="mt-8">
            <button className="btn btn-secondary text-primary font-extrabold lowercase">
              Get Started
            </button>
          </div>
        </HeroText>
      </Hero>

      <div className="flex justify-between items-center mt-16 mb-16 gap-14 max-md:flex-col h-20">
        <p className="flex items-center text-neutral-content font-extrabold text-xl">
          <Emoji kind="map" size="lg" className="animate-spin-slow">
            🌎
          </Emoji>
          <span className="ml-2">Explore the world</span>
        </p>
        <p className="flex items-center text-neutral-content font-extrabold text-xl">
          <Emoji kind="map" size="lg" className="animate-spin-slow">
            🌍
          </Emoji>
          <span className="ml-2">Discover new places</span>
        </p>
        <p className="flex items-center text-neutral-content font-extrabold text-xl">
          <Emoji kind="map" size="lg" className="animate-spin-slow">
            🌏
          </Emoji>
          <span className="ml-2">Meet new people</span>
        </p>
      </div>
    </Wrap>
  );
};

export default Home;
