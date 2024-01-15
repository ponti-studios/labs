import styled from "@emotion/styled";
import { Link } from "react-router-dom";
import Emoji from "ui/Emoji";

import { LOGIN } from "src/constants/routes";
import { mediaQueries } from "src/constants/styles";

import svg from "./world.svg";

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
      <HeroText className="flex mt-16 mb-16 max-md:flex-col w-44">
        <div className="flex text-primary font-extrabold text-4xl mb-8">
          <Emoji kind="map" size="lg" className="animate-spin-slow">
            🌎
          </Emoji>
          <p className="ml-2">Make the world yours.</p>
        </div>
        <div className="flex font-extrabold text-md">
          <Emoji kind="map" size="md">
            📍
          </Emoji>
          <p className="ml-2">Save the places you love and want to visit.</p>
        </div>
        <div className="flex font-extrabold text-md">
          <Emoji kind="map" size="md">
            👀
          </Emoji>
          <p className="ml-2">Discover your friend&apos;s fave places</p>
        </div>
        <div className="flex font-extrabold text-md">
          <Emoji kind="map" size="md">
            🤩
          </Emoji>
          <p className="ml-2">Never wonder where to go again</p>
        </div>
        <div className="mt-2">
          <Link to={LOGIN} className="btn btn-primary text-white">
            Get Started
          </Link>
        </div>
      </HeroText>
    </Wrap>
  );
};

export default Home;
