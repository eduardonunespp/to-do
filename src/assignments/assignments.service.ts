import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssignmentEntity } from './entity';
import { DeleteResult, Repository } from 'typeorm';
import { CreateAssignmentDto, UpdatedAssignmentDto } from './dtos';
import { AssignmentListService } from 'src/assignment-list/assignment-list.service';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(AssignmentEntity)
    private readonly assignmentsRepository: Repository<AssignmentEntity>,
    private readonly assignmentListService: AssignmentListService
  ) {}
  async createAssignment(
    createAssignment: CreateAssignmentDto
  ): Promise<AssignmentEntity> {
    await this.assignmentListService.findAssignmentListById(
      createAssignment.assignmentListId
    );

    const date = createAssignment.deadLine;
    const formattedDate = new Date(date);

    return await this.assignmentsRepository.save({
      ...createAssignment,
      deadLine: formattedDate
    });
  }

  async findAssignments(): Promise<AssignmentEntity[]> {
    const assignments = await this.assignmentsRepository.find();

    if (!assignments || assignments.length === 0) {
      throw new NotFoundException(`assignments not found`);
    }

    return assignments;
  }

  async findAssignmentById(assignmentId: string): Promise<AssignmentEntity> {
    const assignment = await this.assignmentsRepository.findOne({
      where: {
        id: assignmentId
      }
    });

    if (!assignment) {
      throw new NotFoundException(
        `Assignment with ID ${assignmentId} not found`
      );
    }

    return assignment;
  }

  async updatedConcludeAssignment(
    assignmentId: string
  ): Promise<AssignmentEntity> {
    const assignment = await this.findAssignmentById(assignmentId);

    if (!assignment.concluded) {
      assignment.concluded = true;
      assignment.concludeAt = new Date();
    }

    return this.assignmentsRepository.save(assignment);
  }

  async updatedUnconcludeAssignment(
    assignmentId: string
  ): Promise<AssignmentEntity> {
    const assignment = await this.findAssignmentById(assignmentId);

    if (assignment.concluded) {
      assignment.concluded = false;
      assignment.concludeAt = null;
    }

    return this.assignmentsRepository.save(assignment);
  }

  async deleteAssignment(assignmentId: string): Promise<DeleteResult> {
    await this.findAssignmentById(assignmentId);

    return this.assignmentsRepository.delete({ id: assignmentId });
  }

  async updateAssignment(
    assignmentId: string,
    assignmentUpdated: UpdatedAssignmentDto
  ): Promise<AssignmentEntity> {
    const assignment = await this.findAssignmentById(assignmentId);

    return this.assignmentsRepository.save({
      ...assignment,
      ...assignmentUpdated
    });
  }
}
