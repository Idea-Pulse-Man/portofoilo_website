"use client";

// Ionicons 5 (same set the Jack site uses), bundled through react-icons
import {
  IoArrowForwardOutline,
  IoArrowUp,
  IoCallOutline,
  IoCartOutline,
  IoChatbubbles,
  IoChevronForwardOutline,
  IoColorPaletteOutline,
  IoCubeOutline,
  IoDiamondOutline,
  IoFilmOutline,
  IoHandLeftOutline,
  IoHeartOutline,
  IoLocationOutline,
  IoLogoBehance,
  IoLogoFigma,
  IoLogoFirebase,
  IoLogoInstagram,
  IoLogoJavascript,
  IoLogoLinkedin,
  IoLogoNodejs,
  IoLogoReact,
  IoLogoSass,
  IoLogoVue,
  IoLogoWordpress,
  IoMail,
  IoMailOutline,
  IoPersonCircle,
  IoRocketOutline,
} from "react-icons/io5";

const icons = {
  arrow: IoArrowForwardOutline,
  "arrow-up": IoArrowUp,
  behance: IoLogoBehance,
  call: IoCallOutline,
  cart: IoCartOutline,
  chat: IoChatbubbles,
  chevron: IoChevronForwardOutline,
  cube: IoCubeOutline,
  diamond: IoDiamondOutline,
  figma: IoLogoFigma,
  film: IoFilmOutline,
  firebase: IoLogoFirebase,
  hand: IoHandLeftOutline,
  heart: IoHeartOutline,
  instagram: IoLogoInstagram,
  javascript: IoLogoJavascript,
  linkedin: IoLogoLinkedin,
  location: IoLocationOutline,
  mail: IoMail,
  "mail-outline": IoMailOutline,
  nodejs: IoLogoNodejs,
  palette: IoColorPaletteOutline,
  person: IoPersonCircle,
  react: IoLogoReact,
  rocket: IoRocketOutline,
  sass: IoLogoSass,
  vue: IoLogoVue,
  wordpress: IoLogoWordpress,
};

export default function Icon({ name, className }) {
  const Svg = icons[name];
  return Svg ? <Svg className={className} aria-hidden="true" focusable="false" /> : null;
}
