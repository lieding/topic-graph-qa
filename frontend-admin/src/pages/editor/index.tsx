import { useParams } from "react-router-dom";

export default () => {
  let params = useParams();
  console.log(params);
  return (
    <div>
      <h1>Editor</h1>
    </div>
  )
}