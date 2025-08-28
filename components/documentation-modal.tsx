import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function DocumentationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Documentation & Help</AlertDialogTitle>
          <AlertDialogDescription>
            This tool analyzes resume data to detect potential bias in hiring processes.
            <br />
            <br />
            <b>How to Use:</b>
            <br />
            1. Upload a CSV file containing resume data. Ensure the CSV includes columns for "Resume" (resume text) and
            "Score" (match score).
            <br />
            2. The tool infers gender and race from the resume data.
            <br />
            3. It then compares match scores across demographic groups to identify potential bias.
            <br />
            <br />
            <b>Data Privacy:</b>
            <br />
            All analysis is performed locally in your browser. No data is sent to any external servers.
            <br />
            <br />
            <b>Accuracy:</b>
            <br />
            Demographic inferences are probabilistic and may not always be accurate. Use with caution.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
