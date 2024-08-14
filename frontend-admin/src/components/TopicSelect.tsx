import { Cascader, type CascaderProps, type GetProp } from 'antd';
import { getTopicConfig } from '../utils';

type DefaultOptionType = GetProp<CascaderProps, 'options'>[number];

interface Option {
  value: string;
  label: string;
  children?: Option[];
}

const options: Option[] = getTopicConfig().map(({ topic, subTopics }) => ({
  value: topic,
  label: topic,
  children: subTopics.map(({ subTopic, description }) => ({
    value: subTopic,
    label: `${subTopic}(${description})`,
  })),
}));

const filter = (inputValue: string, path: DefaultOptionType[]) =>
  path.some(
    (option) => (option.label as string).indexOf(inputValue.toUpperCase()) > -1,
  );

const TopicSelect = ({setTopic, disabled}: {
  setTopic: (topic: string, subTopic: string) => void
  disabled?: boolean
}) => {
  const onChange: CascaderProps<Option>['onChange'] = (_, selectedOptions) => {
    const [topic, subTopic] = selectedOptions.map(it => it.value);
    setTopic(topic, subTopic);
  };

  return (
    <Cascader
      size='small'
      options={options}
      onChange={onChange}
      placeholder="Please select"
      showSearch={{ filter }}
      disabled={disabled}
      onSearch={(value) => console.log(value)}
    />
  );
}

export default TopicSelect;