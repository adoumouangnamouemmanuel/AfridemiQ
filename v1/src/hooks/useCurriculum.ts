import { useState, useEffect, useCallback } from "react";
import { curriculumApiService } from "../services/learning/api.curriculum.service";
import type { Curriculum } from "../types/learning/curriculum.types";
import { useUser } from "../utils/UserContext";

interface CurriculumFilters {
  country?: string;
  series?: string;
  educationLevel?: string;
}

interface UseCurriculumResult {
  curriculum: Curriculum | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Education level mapping between English and French
const EDUCATION_LEVEL_MAPPING: Record<string, string[]> = {
  primary: ["primary", "primaire"],
  secondary: ["secondary", "secondaire"],
  higher: ["higher", "supérieur", "superieur"],
  primaire: ["primary", "primaire"],
  secondaire: ["secondary", "secondaire"],
  supérieur: ["higher", "supérieur", "superieur"],
  superieur: ["higher", "supérieur", "superieur"],
};

export const useCurriculum = (
  curriculumId?: string,
  filters?: CurriculumFilters
): UseCurriculumResult => {
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  console.log("🔗 useCurriculum Hook - Initialized with:", {
    curriculumId,
    filters,
    userCountry: user?.country,
  });

  const fetchCurriculum = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔗 useCurriculum Hook - Starting fetch...");

      let data: Curriculum;

      if (curriculumId) {
        console.log("🔗 useCurriculum Hook - Fetching by ID:", curriculumId);
        data = await curriculumApiService.getCurriculumById(curriculumId);
      } else if (filters?.country) {
        console.log(
          "🔗 useCurriculum Hook - Fetching by country:",
          filters.country,
          "series:",
          filters.series,
          "educationLevel:",
          filters.educationLevel
        );

        const curricula = await curriculumApiService.getCurriculaByCountry(
          filters.country
        );
        console.log(
          "🔗 useCurriculum Hook - Found curricula:",
          curricula.length
        );

        // Filter by series if provided
        let filteredCurricula = curricula;
        if (filters.series) {
          filteredCurricula = curricula.filter((curr: Curriculum) =>
            curr.series?.includes(filters.series!)
          );
          console.log(
            "🔗 useCurriculum Hook - After series filter:",
            filteredCurricula.length
          );
        }

        // Filter by education level if provided (with language mapping)
        // Add this safety check in your useCurriculum hook
        if (filters.educationLevel) {
          const acceptableEducationLevels = EDUCATION_LEVEL_MAPPING[
            filters.educationLevel
          ] || [filters.educationLevel];

          console.log(
            "🔗 useCurriculum Hook - Looking for education levels:",
            acceptableEducationLevels,
            "in curricula:",
            filteredCurricula.map((c) => ({
              id: c._id,
              level: c.educationLevel,
            }))
          );

          filteredCurricula = filteredCurricula.filter((curr: Curriculum) =>
            acceptableEducationLevels.some(
              (level) =>
                // Add safety checks here
                level &&
                curr.educationLevel &&
                curr.educationLevel.toLowerCase() === level.toLowerCase()
            )
          );
        }
        if (filteredCurricula.length === 0) {
          // Provide more helpful error message
          const availableCurricula = curricula.map((c) => ({
            country: c.country,
            educationLevel: c.educationLevel,
            series: c.series,
          }));

          console.log(
            "🔗 useCurriculum Hook - Available curricula:",
            availableCurricula
          );

          throw new Error(
            `No curriculum found for ${filters.country} with series "${
              filters.series
            }" and education level "${
              filters.educationLevel
            }". Available: ${JSON.stringify(availableCurricula)}`
          );
        }

        // Take the first matching curriculum (preferably active)
        data =
          filteredCurricula.find((c) => c.isActive) || filteredCurricula[0];
        console.log("🔗 useCurriculum Hook - Selected curriculum:", {
          id: data._id,
          country: data.country,
          educationLevel: data.educationLevel,
          series: data.series,
        });
      } else {
        throw new Error("No curriculum ID or country filter provided");
      }

      setCurriculum(data);
      console.log(
        "🔗 useCurriculum Hook - Successfully loaded curriculum:",
        data.country,
        data.series,
        data.educationLevel
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch curriculum";
      setError(errorMessage);
      console.error("🔗 useCurriculum Hook - Error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    curriculumId,
    filters?.country,
    filters?.series,
    filters?.educationLevel,
  ]);

  useEffect(() => {
    fetchCurriculum();
  }, [fetchCurriculum]);

  return {
    curriculum,
    isLoading,
    error,
    refetch: fetchCurriculum,
  };
};
