import { useEffect, useContext } from "react";
import { SchoolContext } from "../context/SchoolContext";

/**
 * useSchoolRefresh - Re-runs a callback whenever the active school changes.
 * Usage: useSchoolRefresh(fetchData);
 */
export function useSchoolRefresh(callback) {
  const ctx = useContext(SchoolContext);
  const schoolId = ctx?.currentSchool?._id;

  useEffect(() => {
    if (callback) callback();
  }, [schoolId]);

  useEffect(() => {
    const handler = () => { if (callback) callback(); };
    window.addEventListener("school-switched", handler);
    return () => window.removeEventListener("school-switched", handler);
  }, []);
}
