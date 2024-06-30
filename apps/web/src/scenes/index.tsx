import styled from "@emotion/styled";
import { Eye, Globe2, Heart, Pin } from "lucide-react";
import { Link, Navigate } from "react-router-dom";

import { useAuth } from "src/lib/auth";
import { DASHBOARD, LOGIN } from "src/lib/routes";
import { mediaQueries } from "src/lib/styles";

const Wrap = styled.div`
  position: relative;
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

const LandingPage = () => {
	const { user } = useAuth();

	if (user) {
		return <Navigate to={DASHBOARD} />;
	}

	return (
		<Wrap>
			<div className="flex flex-col items-center justify-center w-full">
				<div className="flex items-center justify-center gap-2 text-slate-600 font-extrabold mb-8 py-[100px] border-2 border-slate-300 rounded-xl w-full">
					<div>
						<Globe2 className="animate-pulse" size={50} />
					</div>
					<div className="flex items-center justify-center">
						<p className="text-4xl text-slate-600" data-testid="home-header">
							The world is <i className="tracking-tight">finally</i> yours.
						</p>
					</div>
				</div>
				<div className="flex flex-col gap-4 mb-4 font-extrabold text-xl w-full">
					<div className="flex justify-start items-center gap-4 py-[20px]">
						<Pin size={50} />
						<p className="text-xl font-extrabold">
							Never forget the places you love and want to visit.
						</p>
					</div>
					<div className="flex justify-start items-center gap-4 py-[20px]">
						<Eye size={50} />
						<p className="text-xl font-extrabold">
							Discover your friend&apos;s fave places
						</p>
					</div>
					<div className="flex justify-start items-center gap-4 py-[20px]">
						<Heart size={50} />
						<p className="text-xl font-extrabold">
							Never wonder where to go again
						</p>
					</div>
				</div>
				<div className="mt-2">
					<Link to={LOGIN} className="btn btn-primary text-white">
						Get Started
					</Link>
				</div>
			</div>
		</Wrap>
	);
};

export default LandingPage;
