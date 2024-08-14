import { useNavigate } from "react-router-dom";
import { getTopicConfig } from "../../utils";
import styles from './index.module.css';

const TopicConfig = getTopicConfig();

export default () => {

  const navigate = useNavigate();

  const go = (topic: string, subTopic: string) => {
    navigate(`/editor/${topic}/${subTopic}`);
  }

  return (
    <div>
      <h1>Index</h1>
      {
        TopicConfig.map(({ topic, description, subTopics }) => (
          <div key={topic}>
            <div className={styles.topicTitle}>
              <h3>{topic}</h3>
              <span>{description}</span>
            </div>
            <ul>
              {
                subTopics.map(({ subTopic, description }) => (
                  <li key={subTopic} className={styles.li} onClick={() => go(topic, subTopic)}>
                    <h4>{subTopic}</h4>
                    <span>{description}</span>
                  </li>
                ))
              }
            </ul>
          </div>
        ))
      }
    </div>
  )
}