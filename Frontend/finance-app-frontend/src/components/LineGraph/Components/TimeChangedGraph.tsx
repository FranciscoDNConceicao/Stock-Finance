import SegmentedControl from '../../ui/SegmentedControl'
import { TIME_RANGES, TimeRange } from '../../../api/types'

interface TimeChangedGraphProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
}

export default function TimeChangedGraph({ value, onChange }: TimeChangedGraphProps) {
  return <SegmentedControl label="Time range" options={TIME_RANGES} value={value} onChange={onChange} />
}
