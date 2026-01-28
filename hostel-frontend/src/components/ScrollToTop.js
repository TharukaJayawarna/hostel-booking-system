import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // පිටුව මාරු වන සෑම විටම උඩට Scroll කරයි
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;