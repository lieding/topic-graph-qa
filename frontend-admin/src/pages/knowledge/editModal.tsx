import { useMemo, useState } from "react";
import { Input, Modal, Form, Button, Select, Row, Col, FormInstance, InputNumber, AutoComplete, Space, Tooltip, Divider } from 'antd';
import { DefaultRelationType, insertKnowledge, insertNode, insertRelation, searchCloseNodes, summarizeTextKnowledge } from "./helper";
import { detectLang, LangMap } from '../../utils/langDetection';
import { debounce } from "../../utils";
import type { HeaderMap } from '../../../../src/prompts/entityRelationExtract';
import { CheckOutlined, CloseOutlined, InfoCircleOutlined } from "@ant-design/icons";
import TagInput from "../../components/TagInput";
import TopicSelect from "../../components/TopicSelect";
import { API } from "../../../../src/api/typing";

const { TextArea } = Input;

type ParsedRelation = HeaderMap & {
  _id: string // Created when instantiated, not the id of database
  id?: string // The id of database, after being inserted
  _sourceId?: string
  _targetId?: string
  topic?: string
  subTopic?: string
};

type SearchedCloseNodeType = API.Editor.CloseNodesSearchResponse['nodes'][number] & {
  value: string
  label: string
}

const DefaultRelationForm = {
  source: '',
  source_type: '',
  source_description: '',
  target: '',
  target_type: '',
  target_description: '',
  relation_type: '',
  relation_description: '',
  strength: 5,
};

const InputFormItem = ({ name, label, form, disabled }: {
  name: string
  label: string
  disabled?: boolean
  form: FormInstance<any>
}) => (
  <Form.Item
    name={name}
    label={label}
    required
  >
    <Input
      disabled={disabled}
      size="small"
      value={form.getFieldValue(name)}
      onChange={(e) => form.setFieldValue(name, e.target.value)}
    />
  </Form.Item>
)

enum NodeStatusEnum {
  INPUT,
  SEARCHING,
  SELECTED,
  INSERTING,
  INSERTED,
}

const RelationRow = ({ parsedRelation, removeRow }: {
  parsedRelation: ParsedRelation
  removeRow: (id: string) => void
}) => {
  const [ sourceNodeStatus, setSourceNodeStatus ] = useState(NodeStatusEnum.INPUT);
  const [ targetNodeStatus, setTargetNodeStatus ] = useState(NodeStatusEnum.INPUT);
  const [sourceOptions, setSourceOptions] =
    useState<SearchedCloseNodeType[]>([]);
  const [targetOptions, setTargetOptions] =
    useState<SearchedCloseNodeType[]>([]);
  const [ relationStatus, setRelationStatus ] = useState(NodeStatusEnum.INPUT);
  const [ sourceTypes, setSourceTypes ] = useState<string[]>([]);
  const [ targetTypes, setTargetTypes ] = useState<string[]>([]);
  const [ topicConfig, setTopicConfig ] = useState<{ topic: string, subTopic: string }>();
  const [form] = Form.useForm();

  const setTopicInfo = (topic: string, subTopic: string) => {
    parsedRelation.topic = topic;
    parsedRelation.subTopic = subTopic;
    setTopicConfig({ topic, subTopic });
  }

  const sourceDisabled = sourceNodeStatus !== NodeStatusEnum.INPUT;
  const targetDisabled = targetNodeStatus !== NodeStatusEnum.INPUT;
  const sourceValid =
    [NodeStatusEnum.INSERTED, NodeStatusEnum.SELECTED].includes(sourceNodeStatus);
  const targetValid =
    [NodeStatusEnum.INSERTED, NodeStatusEnum.SELECTED].includes(targetNodeStatus);
  const sourceInsertBtnVis = sourceNodeStatus === NodeStatusEnum.INPUT
    && form.getFieldValue('source') && sourceTypes.length
    && form.getFieldValue('source_description')
    && !!topicConfig?.subTopic;
  const targetInsertBtnVis = targetNodeStatus === NodeStatusEnum.INPUT
    && form.getFieldValue('target') && targetTypes.length
    && form.getFieldValue('target_description')
    && !!topicConfig?.subTopic;
  const sourceInserting = sourceNodeStatus === NodeStatusEnum.INSERTING;
  const targetInserting = targetNodeStatus === NodeStatusEnum.INSERTING;
  const relationInsertBtnVis = relationStatus !== NodeStatusEnum.INSERTED
    && [NodeStatusEnum.INSERTED, NodeStatusEnum.SELECTED].includes(sourceNodeStatus)
    && [NodeStatusEnum.INSERTED, NodeStatusEnum.SELECTED].includes(targetNodeStatus)
    && parsedRelation._sourceId && parsedRelation._targetId
    && form.getFieldValue('relation_type') && form.getFieldValue('relation_description');

  const forceUpdate = () => setSourceTypes(items => items.slice());
  
  const searchNodes = (flag: 'source' | 'target') => {
    const topic = topicConfig?.topic, subTopic = topicConfig?.subTopic;
    if (!topic || !subTopic) return;
    const name = form.getFieldValue(flag);
    const types = flag === 'source' ? sourceTypes : targetTypes;
    if (!name || !types?.length) return;
    flag === 'source' ? setSourceNodeStatus(NodeStatusEnum.SEARCHING) :
      setTargetNodeStatus(NodeStatusEnum.SEARCHING);
    searchCloseNodes(topic, subTopic, name, types)
      .then(res => {
        if (res?.nodes?.length) {
          const nodes = res.nodes
            .map((node) => ({ ...node, value: node.name, label: node.name }));
          flag === 'source' ? setSourceOptions(nodes) : setTargetOptions(nodes);
        }
      })
      .finally(() => {
        flag === 'source' ? setSourceNodeStatus(NodeStatusEnum.INPUT) :
          setTargetNodeStatus(NodeStatusEnum.INPUT);
      })
  }

  const nodeSelectHandler = (flag: 'source' | 'target', node: SearchedCloseNodeType | undefined) => {
    if (!node) return;
    const { name, description, types } = node;
    form.setFieldValue(flag, name);
    form.setFieldValue(`${flag}_description`, description);
    if (flag === 'source') {
      setSourceTypes(types);
      setSourceNodeStatus(NodeStatusEnum.SELECTED);
      parsedRelation._sourceId = node.id;
    } else {
      setTargetTypes(types);
      setTargetNodeStatus(NodeStatusEnum.SELECTED);
      parsedRelation._targetId = node.id;
    }
  }

  const nodeInsertHandler = (flag: 'source' | 'target') => {
    const topic = topicConfig?.topic, subTopic = topicConfig?.subTopic;
    if (!topic || !subTopic) return;
    const name = form.getFieldValue(flag),
      description = form.getFieldValue(`${flag}_description`),
      types = flag === 'source' ? sourceTypes : targetTypes;
    if (!name || !types?.length || !description) return;
    flag === 'source' ? setSourceNodeStatus(NodeStatusEnum.INSERTING) :
      setTargetNodeStatus(NodeStatusEnum.INSERTING);
    insertNode(topic, subTopic, { name, description, types })
      .then(res => {
        const insertedId = res?.insertedId;
        if (!res?.insertedId) return;
        if (flag === 'source') {
          setSourceNodeStatus(NodeStatusEnum.INSERTED);
          parsedRelation._sourceId = insertedId;
        } else {
          setTargetNodeStatus(NodeStatusEnum.INSERTED);
          parsedRelation._targetId = insertedId;
        }
      }).catch(() => {
        flag === 'source' ? setSourceNodeStatus(NodeStatusEnum.INPUT) :
          setTargetNodeStatus(NodeStatusEnum.INPUT);
      })
  }

  const relationInsertHandler = () => {
    const topic = topicConfig?.topic, subTopic = topicConfig?.subTopic;
    if (!topic || !subTopic) return;
    const relation = form.getFieldValue('relation_type'),
      relationDesc = form.getFieldValue('relation_description'),
      strength = Number(form.getFieldValue('strength')),
      sourceId = parsedRelation._sourceId, targetId = parsedRelation._targetId,
      source = form.getFieldValue('source'), target = form.getFieldValue('target'),
      sourceDesc = form.getFieldValue('source_description'),
      targetDesc = form.getFieldValue('target_description');
    if (!relation || !relationDesc || !strength || !sourceId || !targetId || !source || !target || !sourceDesc || !targetDesc)
      return;
    setRelationStatus(NodeStatusEnum.INSERTING);
    insertRelation(topic, subTopic, { relation, relationDesc, strength, sourceId, targetId, source, target, sourceDesc, targetDesc })
      .then(res => {
        const insertedId = res?.insertedId;
        if (!insertedId) return void setRelationStatus(NodeStatusEnum.INPUT);
        parsedRelation.id = insertedId;
        setRelationStatus(NodeStatusEnum.INSERTED);
      })
      .catch(() => setRelationStatus(NodeStatusEnum.INPUT));
  }

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          ...DefaultRelationForm,
          ...parsedRelation,
          strength: Number(parsedRelation.strength) ?? 5,
        }}
        onValuesChange={forceUpdate}
      >
        <Row gutter={8} align='middle'>
          <Col span={4}>
            <Form.Item label="Topic Select" name="topic" required
              tooltip={{ title: 'You should first select this', icon: <InfoCircleOutlined /> }}
            >
              <TopicSelect setTopic={setTopicInfo} disabled={relationStatus !== NodeStatusEnum.INPUT} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="relation_type" label="Relation Type" required>
              <AutoComplete
                options={DefaultRelationType}
                value={form.getFieldValue('relation_type')}
                onChange={(value) => form.setFieldValue('relation_type', value)}
                size="small"
              />
            </Form.Item>
          </Col>
          <Col span={4}><InputFormItem name="relation_description" label="Relation Description" form={form} /></Col>
          <Col span={2}>
            <Form.Item label="Strength" name="strength" required>
              <InputNumber min={1} max={10} size="small" />
            </Form.Item>
          </Col>
          <Col span={4}>
            {
              relationInsertBtnVis && (
                <Tooltip title="The already inserted relation will not be removed">
                  <Button
                    type="primary" size="small"
                    onClick={relationInsertHandler}
                    loading={relationStatus === NodeStatusEnum.INSERTING}
                  >Insert Relation</Button>
                </Tooltip>
              )
            }
          </Col>
          <Col span={1}>
            <Tooltip title="The already inserted nodes will not be removed">
              {
                relationStatus === NodeStatusEnum.INSERTED ? (
                  <CheckOutlined twoToneColor="#52c41a" />
                ) : (
                  <Button
                    danger
                    type="primary"
                    shape="circle"
                    icon={<CloseOutlined />}
                    disabled={relationStatus === NodeStatusEnum.INSERTING}
                    size="small"
                    onClick={() => removeRow(parsedRelation._id)}
                  />
                )
              }
            </Tooltip>
          </Col>
        </Row>
        {/* SOURCE NODE INPUT */}
        <Row gutter={8}>
          <Col span={6}>
            <Form.Item
              name="source" label="Source" required
              tooltip={{ title: 'The SEARCH is based on Type selection', icon: <InfoCircleOutlined /> }}
            >
              <Space.Compact>
                <AutoComplete
                  options={sourceOptions}
                  value={form.getFieldValue('source')}
                  onChange={(value) => form.setFieldValue('source', value)}
                  onSelect={value => nodeSelectHandler('source', sourceOptions.find(node => node.value === value))}
                  disabled={sourceDisabled}
                  style={{ width: 120 }}
                  size="small"
                />
                <Button
                  type="primary" size="small" disabled={sourceDisabled}
                  loading={sourceNodeStatus === NodeStatusEnum.SEARCHING}
                  onClick={() => searchNodes('source')}
                >
                  Search
                </Button>
              </Space.Compact>
            </Form.Item>
          </Col>
          <Col span={4}>
            <InputFormItem name="source_description" label="Source Description" form={form} disabled={sourceDisabled} />
          </Col>
          <Col span={10}>
            <Form.Item name="sourceTypes" label="Source Types" required>
              <TagInput
                texts={sourceTypes}
                setTexts={(texts) => !sourceDisabled && setSourceTypes(texts)}
                disabled={sourceDisabled}
              />
            </Form.Item>
          </Col>
          <Col span={2}>
            {
              sourceInsertBtnVis && (
                <Tooltip title="The already inserted node cannot be changed">
                  <Button
                    type="primary"
                    size="small"
                    loading={sourceInserting}
                    onClick={() => nodeInsertHandler('source')}
                  >Insert</Button>
                </Tooltip>
              )
            }
          </Col>
          <Col span={1}>
            { sourceValid && (<CheckOutlined twoToneColor="#52c41a" />) }
          </Col>
        </Row>
        {/* TARGET NODE INPUT */}
        <Row gutter={8}>
          <Col span={6}>
            <Form.Item name="target" label="Target" required
              tooltip={{ title: 'The SEARCH is based on Type selection', icon: <InfoCircleOutlined /> }}
            >
              <Space.Compact>
                <AutoComplete
                  options={targetOptions}
                  value={form.getFieldValue('target')}
                  onChange={(value) => form.setFieldValue('target', value)}
                  onSelect={value => nodeSelectHandler('target', targetOptions.find(node => node.value === value))}
                  disabled={targetDisabled}
                  style={{ width: 120 }}
                  size="small"
                />
                <Button
                  type="primary" size="small" disabled={targetDisabled}
                  loading={targetNodeStatus === NodeStatusEnum.SEARCHING}
                  onClick={() => searchNodes('target')}
                >
                  Search
                </Button>
              </Space.Compact>
            </Form.Item>
          </Col>
          <Col span={4}>
            <InputFormItem name="target_description" label="Target Description" form={form} disabled={targetDisabled} />
          </Col>
          <Col span={10}>
            <Form.Item name="targetTypes" label="Target Types" required>
              <TagInput
                texts={targetTypes}
                setTexts={(texts) => !targetDisabled && setTargetTypes(texts)}
                disabled={targetDisabled}
              />
            </Form.Item>
          </Col>
          <Col span={2}>
            {
              targetInsertBtnVis && (
                <Tooltip title="The already inserted node cannot be changed">
                  <Button
                    type="primary"
                    size="small"
                    loading={targetInserting}
                    onClick={() => nodeInsertHandler('target')}
                  >Insert</Button>
                </Tooltip>
              )
            }
          </Col>
          <Col span={1}>
            { targetValid && (<CheckOutlined twoToneColor="#52c41a" />) }
          </Col>
        </Row>
      </Form>
      <Divider />
    </>
  );
}

const NodeRelationArea = ({
  parsedRelations,
  setParsedRelations
}: {
  parsedRelations: ParsedRelation[]
  setParsedRelations: React.Dispatch<React.SetStateAction<ParsedRelation[]>>
}) => {

  const addNew = () => setParsedRelations(relations =>
    [...relations, { _id: crypto.randomUUID() } as ParsedRelation]);
  
  const removeRow = (id: string) =>
    setParsedRelations(relations => relations.filter(it => it._id !== id));

  return (
    <>
      {
        parsedRelations.map(it =>
          <RelationRow key={it._id} parsedRelation={it} removeRow={removeRow} />
        )
      }
      <Row justify="end">
        <Button type="primary" onClick={addNew}>Add</Button>
      </Row>
    </>
  );
}

export enum EditModalTypeEnum {
  CREATE = 'CREATE',
  EDIT = 'EDIT'
}

interface IProps {
  isOpen: boolean
  close: () => void
  type: EditModalTypeEnum
}

const FormInitialValues = {
  input: '',
  summary: ''
}

const LangConfig = Object.values(LangMap)
  .map(({ name, iso }) => ({ value: iso, label: name }));

export default ({ isOpen, close, type }: IProps) => {

  const [form] = Form.useForm();
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [ detectedLang, setDetectedLang ] =
    useState<{ name: string, iso: string }>();
  const [ parsedRelations, setParsedRelations ] = useState<ParsedRelation[]>([]);
  const [ confirmLoading, setConfirmLoading ] = useState(false);

  const getSummary = async () => {
    const text = form.getFieldValue('input');
    const lang = detectedLang?.iso;
    if (!text || !lang) return;
    setSummaryLoading(true);
    form.setFieldValue('summary', '');
    summarizeTextKnowledge(text, lang)
      .then(res => {
        if (!res) return;
        form.setFieldValue('summary', res.summary);
        setSummaryLoading(false);
      })
      .catch(() => setSummaryLoading(false));
  }

  const toggleClose = () => {
    form.resetFields();
    setParsedRelations([]);
    setDetectedLang(undefined);
    setSummaryLoading(false);
    setConfirmLoading(false);
    close();
  }

  const debouncedLangDetection = useMemo(() => {
    const fun = debounce((text: string) => {
      const lang = detectLang(text)?.[0];
      if (!lang) return;
      setDetectedLang(lang);
    }, 800);
    return fun;
  }, []);

  const confirmBtnHandler = () => {
    const language = detectedLang?.iso, summary = form.getFieldValue('summary'),
      text = form.getFieldValue('input');
    const tags = [];
    for (const tag of parsedRelations) {
      const { topic, subTopic, id: relationId, _sourceId, _targetId } = tag;
      if (!topic || !subTopic || !relationId || !_sourceId || !_targetId)
        return;
      const obj = { topic, subTopic, relationId };
      tags.push({...obj, id: _sourceId}, {...obj, id: _targetId});
    }
    if (!language || !summary || !text || !tags.length) return;
    setConfirmLoading(true);
    insertKnowledge({
      type: 'TEXT',
      language,
      summary,
      text,
      tags
    }).finally(() => setConfirmLoading(false));
  }

  const isZH = detectedLang?.iso === 'zh';

  return (
    <Modal
      title={type}
      open={isOpen}
      onOk={confirmBtnHandler}
      onCancel={toggleClose}
      maskClosable={false}
      width={1200}
      confirmLoading={confirmLoading}
    >
      <Select
        defaultValue="en"
        style={{ width: 120 }}
        disabled
        value={detectedLang?.iso}
        options={LangConfig}
      />
      <Form
        layout="vertical"
        form={form}
        initialValues={FormInitialValues}
      >
        <Form.Item label="Knowledge text" name="input">
          <TextArea
            value={form.getFieldValue('input')}
            onChange={(e) => {
              form.setFieldValue('input', e.target.value);
              debouncedLangDetection(e.target.value);
            }}
            placeholder="Knowledgae text"
            autoSize={{ minRows: 3, maxRows: 5 }}
          />
        </Form.Item>
        <Button
          size="small"
          type="primary"
          disabled={!form.getFieldValue('input')}
          loading={summaryLoading}
          onClick={() => void getSummary()}
        >
          Get Summary
        </Button>
        <Form.Item label="Summary" name='summary'>
          <TextArea
            value={form.getFieldValue('summary')}
            onChange={(e) => form.setFieldValue('summary', e.target.value)}
            autoSize={{ minRows: 3, maxRows: 5 }}
            count={{
              show: true,
              max: 60,
              strategy: (txt) => isZH ? txt.length : txt.split(' ').length,
            }}
          />
        </Form.Item>
      </Form>
      <NodeRelationArea
        parsedRelations={parsedRelations}
        setParsedRelations={setParsedRelations}
      />
    </Modal>
  );
}