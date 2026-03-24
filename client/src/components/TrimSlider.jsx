import React from 'react';

/**
 * TrimSlider - Simple range input for trimming video duration
 */
export const TrimSlider = ({
  minDuration = 2,
  maxDuration = 6,
  value,
  onChange,
  label = 'Duration'
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {label} ({value}s)
      </label>
      <input
        type="range"
        min={minDuration}
        max={maxDuration}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-dark-secondary rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{minDuration}s (min)</span>
        <span>{maxDuration}s (max)</span>
      </div>
    </div>
  );
};

export default TrimSlider;
