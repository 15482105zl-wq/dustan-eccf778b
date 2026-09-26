import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";

// 起滑区故意不贴屏幕最边缘：安卓系统手势导航（尤其小米/华为等定制系统）
// 会独占最外侧约24-40px的边缘条用于自己的返回手势，落在那个区域的触摸
// 事件网页JS根本收不到。这里把起滑区整体往内挪，避开系统保留区。
const EDGE_MIN = 12;
const EDGE_MAX = 100;
const SWIPE_THRESHOLD = 80;
const MAX_VERTICAL = 60;
const HOME_PATH = "/";

const SwipeBackHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnameRef = useRef(location.pathname);

  useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch.clientX >= EDGE_MIN && touch.clientX <= EDGE_MAX) {
        startX = touch.clientX;
        startY = touch.clientY;
        tracking = true;
      } else {
        tracking = false;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = Math.abs(touch.clientY - startY);

      if (deltaX > SWIPE_THRESHOLD && deltaY < MAX_VERTICAL) {
        if (pathnameRef.current === HOME_PATH) {
          CapacitorApp.exitApp();
        } else {
          navigate(-1);
        }
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [navigate]);

  return null;
};

export default SwipeBackHandler;