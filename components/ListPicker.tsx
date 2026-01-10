import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
  Platform,
  I18nManager,
} from "react-native";
import { ChevronDown, Check, X } from "lucide-react-native";

type Option = {
  label: string;
  value: string;
};

interface ListPickerProps {
  label: string;
  value?: string;
  placeholder?: string;
  options: Option[];
  onChange: (value: string) => void;
  disabled?: boolean;
  style?: any;
  title?: string;
}

export default function ListPicker({
  label,
  value,
  placeholder = "اختر",
  options,
  onChange,
  disabled = false,
  style,
  title = "اختيار",
}: ListPickerProps) {
  const isRTL = I18nManager.isRTL;

  const [open, setOpen] = useState(false);
  const [temp, setTemp] = useState<string | undefined>(value);

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => o.value === value);
    return found?.label;
  }, [value, options]);

  const openModal = () => {
    if (disabled) return;
    setTemp(value);
    setOpen(true);
  };

  const cancel = () => {
    setTemp(value);
    setOpen(false);
  };

  const confirm = () => {
    if (temp !== undefined) onChange(temp);
    setOpen(false);
  };

  const renderItem = ({ item }: { item: Option }) => {
    const selected = item.value === temp;
    return (
      <TouchableOpacity
        style={[styles.row, selected && styles.rowSelected]}
        onPress={() => setTemp(item.value)}
        activeOpacity={0.85}
      >
        <Text
          style={[
            styles.rowText,
            { textAlign: "left" },
            selected && styles.rowTextSelected,
          ]}
        >
          {item.label}
        </Text>

        {selected ? <Check size={20} color="#E53E3E" /> : <View style={{ width: 20 }} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Input */}
      <TouchableOpacity
        style={[styles.inputButton, disabled && styles.inputButtonDisabled]}
        onPress={openModal}
        disabled={disabled}
        activeOpacity={0.85}
      >
        <View
          style={[
            styles.inputContent,
            { flexDirection: "row" },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { textAlign: "left" }]}>
              {label}
            </Text>
            <Text
              style={[
                styles.valueText,
                !selectedLabel && styles.placeholderText,
                { textAlign: "left" },
              ]}
              numberOfLines={1}
            >
              {selectedLabel ?? placeholder}
            </Text>
          </View>

          <ChevronDown size={20} color={disabled ? "#9CA3AF" : "#6B7280"} />
        </View>
      </TouchableOpacity>

      {/* Modal */}
      <Modal transparent visible={open} animationType="slide" onRequestClose={cancel}>
        <Pressable style={styles.modalOverlay} onPress={cancel}>
          <Pressable style={styles.modalContainer} onPress={() => {}}>
            {/* Header */}
            <View
              style={[
                styles.modalHeader,
                { flexDirection: "row" },
              ]}
            >
              <TouchableOpacity onPress={cancel} style={styles.headerButton}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>{title}</Text>

              <TouchableOpacity onPress={confirm} style={styles.headerButton}>
                <Check size={24} color="#E53E3E" />
              </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8 }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },

  inputButton: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  inputButtonDisabled: { backgroundColor: "#F3F4F6", opacity: 0.7 },

  inputContent: {
    alignItems: "center",
    gap: 12,
  },

  label: { fontSize: 13, color: "#6B7280", marginBottom: 6, fontWeight: "600" },
  valueText: { fontSize: 16, fontWeight: "800", color: "#111827" },
  placeholderText: { color: "#9CA3AF", fontWeight: "400" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "75%",
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
  },
  modalHeader: {
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FAFAFA",
  },
  headerButton: { padding: 8 },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },

  row: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  rowSelected: {
    backgroundColor: "#FEE2E2",
  },
  rowText: { fontSize: 16, fontWeight: "700", color: "#111827" },
  rowTextSelected: { color: "#E53E3E" },

  separator: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
  },
});
