import ForensicAtmosphere from "./background/ForensicAtmosphere";
import { useInterfaceMotion } from "./motion/useInterfaceMotion";

const ExperienceLayer = () => {
  useInterfaceMotion();
  return <ForensicAtmosphere />;
};

export default ExperienceLayer;
