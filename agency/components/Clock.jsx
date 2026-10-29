"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { site } from "@/lib/content";

/** The studio's local time (site.timezone), e.g. "02:05 PM EDT" */
export default function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: site.timezone,
      timeZoneName: "short",
    });
    const update = () => setTime(format.format(new Date()));

    update();
    const timer = setInterval(update, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <p className="footer-clock">
      <Icon name="time" />
      Studio time <span>{time || "--:--"}</span>
    </p>
  );
}
