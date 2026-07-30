/**
 * ArchiveBackground
 *
 * Only the optimised ForensicShaderBackground WebGL canvas runs here.
 * The Three.js R3F Canvas was removed — running two full WebGL rAF loops
 * simultaneously was the primary source of dropped frames.
 */
import ExperienceLayer from "../effects/ExperienceLayer";

const ArchiveBackground = () => <ExperienceLayer />;

export default ArchiveBackground;

