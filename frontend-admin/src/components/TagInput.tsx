import { useEffect, useRef, useState } from "react";
import { Flex, Input, Tag, type InputRef } from 'antd';
import { PlusOutlined } from "@ant-design/icons";
import styles from './TagInput.module.css';

const TagItem = ({ tag, handleClose, disabled }: {
  tag: string,
  handleClose: (tag: string) => void
  disabled: boolean
}) => (
  <span key={tag} className={styles.tagItem}>
    <Tag
      closable={!disabled}
      onClose={(e) => {
        e.preventDefault();
        handleClose(tag);
      }}
    >
      {tag}
    </Tag>
  </span>
);

const TagInput = ({
  texts,
  setTexts,
  disabled = false
}: {
  texts: string[]
  setTexts: (texts: string[]) => void
  disabled?: boolean
}) => {
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  const handleClose = (removedTag: string) => {
    const newTags = texts.filter((tag) => tag !== removedTag);
    setTexts(newTags);
  };

  const showInput = () => {
    if (disabled) return;
    setInputVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputValue && !texts.includes(inputValue)) {
      setTexts([...texts, inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  return (
    <Flex wrap gap={1}>
      {texts.map((tag) => (
        <TagItem
          key={tag}
          tag={tag}
          handleClose={handleClose}
          disabled={disabled}
        />
      ))}
      {disabled ? null : inputVisible ? (
        <Input
          ref={inputRef}
          type="text"
          size="small"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
          className={styles.tagInput}
        />
      ) : (
        <Tag onClick={showInput} className={styles.tagPlus}>
          <PlusOutlined />
        </Tag>
      )}
    </Flex>
  );
};

export default TagInput;