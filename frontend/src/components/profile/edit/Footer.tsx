"use client";

import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useCommonStyles } from "../../../styles/commonEditStyle";

interface FooterProps {
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
  cancelText?: string;
  saveText?: string;
  loadingText?: string;
  disabled?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onCancel,
  onSave,
  isSaving,
  cancelText = "Cancel",
  saveText = "Save Changes",
  loadingText = "Saving...",
  disabled = false,
}) => {
  const commonStyles = useCommonStyles();

  return (
    <View style={commonStyles.footer}>
      <TouchableOpacity
        style={[commonStyles.button, commonStyles.cancelButton]}
        onPress={onCancel}
        activeOpacity={0.8}
        disabled={isSaving}
      >
        <Text style={[commonStyles.buttonText, commonStyles.cancelButtonText]}>
          {cancelText}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          commonStyles.button,
          commonStyles.saveButton,
          (isSaving || disabled) && commonStyles.saveButtonDisabled,
        ]}
        onPress={onSave}
        disabled={isSaving || disabled}
        activeOpacity={0.8}
      >
        {isSaving ? (
          <View style={commonStyles.loadingContainer}>
            <ActivityIndicator size="small" color="white" />
            <Text style={commonStyles.loadingText}>{loadingText}</Text>
          </View>
        ) : (
          <Text
            style={[
              commonStyles.buttonText,
              commonStyles.saveButtonText,
              (isSaving || disabled) && commonStyles.saveButtonTextDisabled,
            ]}
          >
            {saveText}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
